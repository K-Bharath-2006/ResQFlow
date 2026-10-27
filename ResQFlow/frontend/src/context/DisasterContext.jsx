import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  FALLBACK_DASHBOARD_DATA,
  FALLBACK_SCENARIOS_LIST,
  FALLBACK_REQUIREMENTS,
  FALLBACK_PRIORITIES,
  FALLBACK_ALLOCATIONS,
  FALLBACK_ML_ANALYSIS,
  FALLBACK_AREAS,
  FALLBACK_FACILITIES,
  FALLBACK_ROADS,
} from '../services/fallbackData';

const DisasterContext = createContext(null);

export const DisasterProvider = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState(FALLBACK_DASHBOARD_DATA.scenario);
  const [dashboardData, setDashboardData] = useState(FALLBACK_DASHBOARD_DATA);
  const [scenariosList, setScenariosList] = useState(FALLBACK_SCENARIOS_LIST);
  const [impactSummary, setImpactSummary] = useState(FALLBACK_DASHBOARD_DATA.impact_summary);
  const [requirements, setRequirements] = useState(FALLBACK_REQUIREMENTS);
  const [priorities, setPriorities] = useState(FALLBACK_PRIORITIES);
  const [allocations, setAllocations] = useState(FALLBACK_ALLOCATIONS);
  const [loading, setLoading] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingMl, setAnalyzingMl] = useState(false);
  const [mlAnalysis, setMlAnalysis] = useState(FALLBACK_ML_ANALYSIS);
  const [demoScenarios, setDemoScenarios] = useState({});
  const [demoCities, setDemoCities] = useState({});
  const [selectedScenarioName, setSelectedScenarioName] = useState('Critical Flood');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchCoreData = useCallback(async () => {
    try {
      setLoading(true);
      const [dash, scns, reqs, prio, alloc, mlScns, latestMl] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getScenarios().catch(() => null),
        api.getRequirements().catch(() => null),
        api.getPriorityAnalysis().catch(() => null),
        api.getAllocations().catch(() => null),
        api.getMlScenarios().catch(() => null),
        api.getLatestMlAnalysis().catch(() => null),
      ]);

      if (dash && dash.scenario) {
        setIsApiConnected(true);
        // Ensure areas and spatial assets are safely present
        const safeAreas = (dash.impact_summary?.areas && dash.impact_summary.areas.length > 0)
          ? dash.impact_summary.areas
          : (dash.areas || FALLBACK_AREAS);

        const safeFacilities = (dash.facilities && dash.facilities.length > 0)
          ? dash.facilities
          : FALLBACK_FACILITIES;

        const safeRoads = (dash.roads && dash.roads.length > 0)
          ? dash.roads
          : FALLBACK_ROADS;

        const enrichedDash = {
          ...dash,
          facilities: safeFacilities,
          roads: safeRoads,
          impact_summary: {
            ...dash.impact_summary,
            areas: safeAreas,
          },
        };

        setDashboardData(enrichedDash);
        setActiveScenario(enrichedDash.scenario);
        setImpactSummary(enrichedDash.impact_summary);

        if (enrichedDash.ml_analysis) {
          setMlAnalysis(enrichedDash.ml_analysis);
          if (enrichedDash.ml_analysis.scenario_name) {
            setSelectedScenarioName(enrichedDash.ml_analysis.scenario_name);
          }
        }
      } else {
        // Backend API is not currently running: operate seamlessly in Standalone / Fallback mode
        setIsApiConnected(false);
        setDashboardData(FALLBACK_DASHBOARD_DATA);
        setActiveScenario(FALLBACK_DASHBOARD_DATA.scenario);
        setImpactSummary(FALLBACK_DASHBOARD_DATA.impact_summary);
      }

      if (Array.isArray(scns) && scns.length > 0) {
        setScenariosList(scns);
      } else {
        setScenariosList(FALLBACK_SCENARIOS_LIST);
      }

      if (Array.isArray(reqs) && reqs.length > 0) {
        setRequirements(reqs);
      } else {
        setRequirements(FALLBACK_REQUIREMENTS);
      }

      if (Array.isArray(prio) && prio.length > 0) {
        setPriorities(prio);
      } else {
        setPriorities(FALLBACK_PRIORITIES);
      }

      if (Array.isArray(alloc) && alloc.length > 0) {
        setAllocations(alloc);
      } else {
        setAllocations(FALLBACK_ALLOCATIONS);
      }

      if (mlScns && Object.keys(mlScns).length > 0) {
        setDemoScenarios(mlScns);
        if (mlScns.cities) {
          setDemoCities(mlScns.cities);
        }
      }

      if (latestMl) {
        setMlAnalysis(latestMl);
        if (latestMl.scenario_name) {
          setSelectedScenarioName(latestMl.scenario_name);
        }
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Backend API unavailable. Operating in built-in disaster operational mode:', err);
      setIsApiConnected(false);
      setDashboardData(FALLBACK_DASHBOARD_DATA);
      setActiveScenario(FALLBACK_DASHBOARD_DATA.scenario);
      setImpactSummary(FALLBACK_DASHBOARD_DATA.impact_summary);
      setRequirements(FALLBACK_REQUIREMENTS);
      setPriorities(FALLBACK_PRIORITIES);
      setAllocations(FALLBACK_ALLOCATIONS);
      setScenariosList(FALLBACK_SCENARIOS_LIST);
      setMlAnalysis(FALLBACK_ML_ANALYSIS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoreData();
  }, [fetchCoreData]);

  const runDisasterAnalysis = async (scenarioId) => {
    setAnalyzing(true);
    try {
      const res = await api.analyzeDisaster(scenarioId).catch(() => null);
      if (res && res.scenario) {
        await fetchCoreData();
        return res;
      }

      // Offline simulation fallback: Switch active scenario locally
      const selected = scenariosList.find((s) => s.id === scenarioId) || FALLBACK_SCENARIOS_LIST[0];
      const updated = {
        ...selected,
        is_active: 1,
        last_analyzed: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setActiveScenario(updated);
      setDashboardData((prev) => ({
        ...prev,
        scenario: updated,
        recent_disaster_analysis: {
          scenario_title: updated.title,
          district: updated.district,
          type: updated.disaster_type,
          scenario_type: updated.scenario_type,
          severity: updated.severity_level,
          last_analyzed: updated.last_analyzed,
          status: 'Active Threat Assessment',
          evacuation_readiness: 'Level 3 Emergency Protocol',
        },
      }));
      return {
        success: true,
        message: `Offline simulation analysis activated for ${updated.title}`,
        scenario: updated,
      };
    } finally {
      setAnalyzing(false);
    }
  };

  const runMlAnalysis = async (payload, scenarioName) => {
    setAnalyzingMl(true);
    try {
      const chosenName = scenarioName || payload.scenario_name || selectedScenarioName;
      const res = await api.analyseDisasterMl({
        ...payload,
        scenario_name: chosenName,
      }).catch(() => null);

      if (res) {
        setMlAnalysis(res);
        if (scenarioName) setSelectedScenarioName(scenarioName);
        await fetchCoreData();
        return res;
      }

      // Standalone ML inference estimation fallback
      const popEst = Math.round(
        (payload.population_density_per_km2 || 3500) *
        ((payload.flood_depth_m || 1.5) * 2.2) *
        ((payload.vulnerable_population_ratio || 0.15) * 5)
      );
      const sevEst = (payload.flood_depth_m || 1.5) > 2.0 ? 'Critical' : ((payload.flood_depth_m || 1.5) > 1.2 ? 'High' : 'Moderate');
      const prioEst = sevEst === 'Critical' ? 'High' : 'Medium';

      const simulatedMl = {
        scenario_name: chosenName,
        location: payload.location || 'Chennai',
        disaster_type: payload.disaster_type || 'Flood',
        prediction: {
          severity: sevEst,
          affected_population: Math.max(1000, popEst),
          priority: prioEst,
        },
        resources: {
          food: { required: popEst * 2, available: 10000, shortage: Math.max(0, popEst * 2 - 10000), status: popEst * 2 > 10000 ? 'Critical Shortage' : 'Sufficient', unit: 'packets' },
          water: { required: popEst * 3, available: 15000, shortage: Math.max(0, popEst * 3 - 15000), status: popEst * 3 > 15000 ? 'Critical Shortage' : 'Sufficient', unit: 'Litres' },
          medical_kits: { required: Math.ceil(popEst / 25), available: 350, shortage: Math.max(0, Math.ceil(popEst / 25) - 350), status: Math.ceil(popEst / 25) > 350 ? 'Critical Shortage' : 'Sufficient', unit: 'kits' },
          blankets: { required: Math.ceil(popEst * 0.85), available: 5000, shortage: Math.max(0, Math.ceil(popEst * 0.85) - 5000), status: Math.ceil(popEst * 0.85) > 5000 ? 'Critical Shortage' : 'Sufficient', unit: 'units' },
        },
        priority_recommendation: {
          recommended_action: `Deploy Priority Logistics Convoys for ${chosenName}`,
          reasons: [
            `${sevEst} severity estimated from hydrologic flood depth metric`,
            `Estimated ${popEst.toLocaleString()} vulnerable citizens in inundation corridor`,
            'Lifeline accessibility impacted; staged staging warehouses activated',
          ],
        },
        inputs: payload,
      };

      setMlAnalysis(simulatedMl);
      if (scenarioName) setSelectedScenarioName(scenarioName);
      return simulatedMl;
    } finally {
      setAnalyzingMl(false);
    }
  };

  return (
    <DisasterContext.Provider
      value={{
        activeScenario,
        dashboardData,
        scenariosList,
        impactSummary,
        requirements,
        priorities,
        allocations,
        loading,
        isApiConnected,
        analyzing,
        analyzingMl,
        mlAnalysis,
        demoScenarios,
        demoCities,
        selectedScenarioName,
        setSelectedScenarioName,
        lastRefreshed,
        refreshData: fetchCoreData,
        runDisasterAnalysis,
        runMlAnalysis,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => useContext(DisasterContext);
