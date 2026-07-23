import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Multi-Tenant Company Database Profiles
export const INITIAL_COMPANIES = [
  {
    id: 'bawar-star',
    name: 'BAWAR STAR PLASTIC INDUSTRY',
    shortName: 'BAWAR STAR',
    code: 'BSPI',
    tagline: 'Plastic Industry & Manufacturing',
    logo: '/logo192.png',
    dbName: 'cashbook_bawar_prod',
    apiEndpoint: '/api/v1/tenants/bawar-star',
    branches: ['Main Branch', 'Kabul Central', 'Herat Office', 'Mazar Regional'],
    defaultBranch: 'Main Branch',
    themeColor: 'amber',
    currency: 'AFN',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-amber-950',
    accentBorder: 'border-amber-400',
    taxId: 'AFN-998234-BS'
  },
  {
    id: 'sky-ariana',
    name: 'SKY ARIANA LTD',
    shortName: 'SKY ARIANA',
    code: 'SKY-BBB',
    tagline: 'Sky Ariana & Balam Bar Baran',
    logo: '/sky-ariana-logo.png',
    dbName: 'cashbook_skyariana_prod',
    apiEndpoint: '/api/v1/tenants/sky-ariana',
    branches: ['Kabul Head Office', 'Balam Bar Baran Port', 'Herat Cargo Hub', 'Mazar Transit', 'Hairatan Border'],
    defaultBranch: 'Kabul Head Office',
    themeColor: 'blue',
    currency: 'USD',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    accentBorder: 'border-blue-500',
    taxId: 'AFN-774102-SA'
  }
];

const CompanyContext = createContext(null);

const STORAGE_KEY_COMPANY = 'cashbook_active_company_id';
const STORAGE_KEY_BRANCH = 'cashbook_active_branch_name';
const STORAGE_KEY_CUSTOM_LOGOS = 'cashbook_custom_company_logos';

export function CompanyProvider({ children, onCompanyChange }) {
  // Load custom logos from localStorage if available
  const [companies, setCompanies] = useState(() => {
    try {
      const storedLogos = localStorage.getItem(STORAGE_KEY_CUSTOM_LOGOS);
      if (storedLogos) {
        const logoMap = JSON.parse(storedLogos);
        return INITIAL_COMPANIES.map(c => ({
          ...c,
          logo: logoMap[c.id] || c.logo
        }));
      }
    } catch (e) {
      console.warn('Unable to parse saved company logos:', e);
    }
    return INITIAL_COMPANIES;
  });

  // Initialize selected company from URL query param or localStorage
  const [currentCompany, setCurrentCompany] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCompany = params.get('company') || params.get('tenant');
      if (urlCompany) {
        const foundUrl = companies.find(c => c.id === urlCompany || c.dbName === urlCompany || c.shortName?.toLowerCase() === urlCompany.toLowerCase());
        if (foundUrl) return foundUrl;
      }
      const storedId = localStorage.getItem(STORAGE_KEY_COMPANY);
      const foundStored = companies.find(c => c.id === storedId);
      return foundStored || companies[0];
    } catch {
      return companies[0];
    }
  });

  // Initialize selected branch from localStorage
  const [activeBranch, setActiveBranch] = useState(() => {
    try {
      const storedBranch = localStorage.getItem(STORAGE_KEY_BRANCH);
      if (storedBranch && currentCompany.branches.includes(storedBranch)) {
        return storedBranch;
      }
      return currentCompany.defaultBranch;
    } catch {
      return currentCompany.defaultBranch;
    }
  });

  const [isSwitching, setIsSwitching] = useState(false);

  // Synchronize active state to localStorage and URL query params
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPANY, currentCompany.id);
      localStorage.setItem('activeTenantId', currentCompany.dbName || currentCompany.id);
      localStorage.setItem(STORAGE_KEY_BRANCH, activeBranch);
      
      const url = new URL(window.location.href);
      if (url.searchParams.get('company') !== currentCompany.id) {
        url.searchParams.set('company', currentCompany.id);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {
      console.warn('Unable to persist company state:', e);
    }
  }, [currentCompany, activeBranch]);

  // Context Switcher Logic
  const switchCompany = useCallback((companyId) => {
    const target = companies.find(c => c.id === companyId || c.dbName === companyId);
    if (!target || target.id === currentCompany.id) return;

    setIsSwitching(true);

    setTimeout(() => {
      setCurrentCompany(target);
      const newDefaultBranch = target.defaultBranch || target.branches[0];
      setActiveBranch(newDefaultBranch);
      
      try {
        localStorage.setItem(STORAGE_KEY_COMPANY, target.id);
        localStorage.setItem('activeTenantId', target.dbName || target.id);
        localStorage.setItem(STORAGE_KEY_BRANCH, newDefaultBranch);
        const url = new URL(window.location.href);
        url.searchParams.set('company', target.id);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.warn('Failed to update localStorage on company switch:', e);
      }

      if (onCompanyChange) {
        onCompanyChange(target, newDefaultBranch);
      }

      setIsSwitching(false);
    }, 200);
  }, [companies, currentCompany.id, onCompanyChange]);

  // Branch Switcher Logic
  const switchBranch = useCallback((branchName) => {
    if (!currentCompany.branches.includes(branchName)) return;
    setActiveBranch(branchName);
    try {
      localStorage.setItem(STORAGE_KEY_BRANCH, branchName);
    } catch (e) {
      console.warn('Failed to update localStorage on branch switch:', e);
    }
  }, [currentCompany]);

  // UPDATEABLE LOGO LOGIC
  const updateCompanyLogo = useCallback((companyId, newLogoUrl) => {
    if (!companyId || !newLogoUrl) return;

    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === companyId) {
          return { ...c, logo: newLogoUrl };
        }
        return c;
      });

      // Persist custom logos map in localStorage
      try {
        const logoMap = updated.reduce((acc, comp) => {
          acc[comp.id] = comp.logo;
          return acc;
        }, {});
        localStorage.setItem(STORAGE_KEY_CUSTOM_LOGOS, JSON.stringify(logoMap));
      } catch (e) {
        console.warn('Failed to persist custom company logo:', e);
      }

      return updated;
    });

    // Update active company if it matches
    setCurrentCompany(prev => {
      if (prev.id === companyId) {
        return { ...prev, logo: newLogoUrl };
      }
      return prev;
    });
  }, []);

  // Update company details (name, code, tagline, branches, etc.)
  const updateCompany = useCallback((companyId, updatedFields) => {
    setCompanies(prev => {
      const updated = prev.map(c => {
        if (c.id === companyId) {
          return { ...c, ...updatedFields };
        }
        return c;
      });

      return updated;
    });

    setCurrentCompany(prev => {
      if (prev.id === companyId) {
        return { ...prev, ...updatedFields };
      }
      return prev;
    });
  }, []);

  // Add new tenant company dynamically
  const addCompany = useCallback((newCompanyData) => {
    const newCompany = {
      id: newCompanyData.id || `company-${Date.now()}`,
      name: newCompanyData.name || 'New Company Ltd',
      shortName: newCompanyData.shortName || newCompanyData.name || 'NEW CO',
      code: newCompanyData.code || 'CO',
      tagline: newCompanyData.tagline || 'Accounting Profile',
      logo: newCompanyData.logo || '/logo192.png',
      dbName: newCompanyData.dbName || `cashbook_${Date.now()}_prod`,
      apiEndpoint: newCompanyData.apiEndpoint || `/api/v1/tenants/${Date.now()}`,
      branches: newCompanyData.branches?.length ? newCompanyData.branches : ['Main Branch'],
      defaultBranch: newCompanyData.defaultBranch || newCompanyData.branches?.[0] || 'Main Branch',
      themeColor: newCompanyData.themeColor || 'indigo',
      currency: newCompanyData.currency || 'USD',
      taxId: newCompanyData.taxId || 'N/A'
    };

    setCompanies(prev => [...prev, newCompany]);
    return newCompany;
  }, []);

  const value = {
    currentCompany,
    activeBranch,
    companies,
    isSwitching,
    switchCompany,
    switchBranch,
    updateCompanyLogo,
    updateCompany,
    addCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    return {
      currentCompany: INITIAL_COMPANIES[0],
      activeBranch: INITIAL_COMPANIES[0].defaultBranch,
      companies: INITIAL_COMPANIES,
      isSwitching: false,
      switchCompany: () => {},
      switchBranch: () => {},
      updateCompanyLogo: () => {},
      updateCompany: () => {},
      addCompany: () => {}
    };
  }
  return context;
}

export const useTenant = () => {
  const ctx = useCompany();
  return {
    activeCompany: ctx.currentCompany,
    companies: ctx.companies,
    switchCompany: ctx.switchCompany,
    activeBranch: ctx.activeBranch,
    switchBranch: ctx.switchBranch,
    tenantId: ctx.currentCompany?.id || ctx.currentCompany?.dbName
  };
};

export const TenantContext = CompanyContext;
export const TenantProvider = CompanyProvider;

export default CompanyContext;
