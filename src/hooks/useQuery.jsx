import { useMemo } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { checkCondition } from '@/helpers/filterHelper';

export const useQuery = ({ collection, where = [], orderBy = null }) => {
  const [table] = useLocalStorage(collection, []);

  const result = useMemo(() => {
    if (!table || !Array.isArray(table)) return [];

    let filteredData = [...table];

    const filters = where;

    if (filters.length > 0) {
      filteredData = filteredData.filter(item => {
        return filters.every(clause =>
          checkCondition(item[clause.field], clause.op, clause.value)
        );
      });
    }

    if (orderBy) {
      const { field, dir = 'asc' } = orderBy;

      filteredData.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      });

      if (dir === 'desc') {
        filteredData.reverse();
      }
    }

    return filteredData;

  }, [table, where, orderBy]);

  return result;
};