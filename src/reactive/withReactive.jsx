import { useEffect } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { useMonitor } from '@/hooks/useMonitor';
import { services } from '@/services';

const useQueries = (queryConfigs) => {
  const results = {};
  Object.entries(queryConfigs).forEach(([name, config]) => {
    results[name] = useQuery(config);
  });
  return results;
};

export const withReactive = (Component, options = {}) => {
  const {
    monitors: monitorNames = [],
    queries = () => ({}),
    init,
  } = options;

  const Wrapper = (props) => {
    const monitors = useMonitor(monitorNames);
    const queryConfigs = queries(props);
    const queryResults = useQueries(queryConfigs);

    useEffect(() => {
      init?.({ services, props });
    }, []);

    return <Component monitors={monitors} services={services} {...queryResults} {...props} />;
  };

  Wrapper.displayName = `withReactive(${Component.displayName || Component.name || 'Component'})`;

  return Wrapper;
};
