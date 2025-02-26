import { parseISO, isValid } from 'date-fns';
import { RestrictionConfig } from './types';
import { BackgroundData } from '../../DateRangePicker.config';

export class RestrictionBackgroundGenerator {
  /**
   * Generate background data from restriction config
   */
  static generateBackgroundData(restrictionConfig?: RestrictionConfig): BackgroundData[] {
    if (!restrictionConfig?.restrictions) return [];
    
    return restrictionConfig.restrictions.flatMap(restriction => {
      if (!restriction.enabled) return [];
      
      switch (restriction.type) {
        case 'daterange':
          return restriction.ranges
            .filter(range => {
              const start = parseISO(range.start);
              const end = parseISO(range.end);
              return isValid(start) && isValid(end) && start <= end;
            })
            .map(range => ({
              startDate: range.start,
              endDate: range.end,
              color: '#ffe6e6'
            }));
          
        case 'allowedranges':
          return restriction.ranges
            .filter(range => {
              const start = parseISO(range.start);
              const end = parseISO(range.end);
              return isValid(start) && isValid(end) && start <= end;
            })
            .map(range => [
              {
                startDate: '1900-01-01',
                endDate: range.start,
                color: '#ffe6e6'
              },
              {
                startDate: range.end,
                endDate: '2100-12-31',
                color: '#ffe6e6'
              }
            ]).flat();
          
        case 'boundary':
          const boundaryDate = parseISO(restriction.date);
          if (!isValid(boundaryDate)) return [];
          
          return [{
            startDate: restriction.direction === 'before' ? '1900-01-01' : restriction.date,
            endDate: restriction.direction === 'before' ? restriction.date : '2100-12-31',
            color: '#ffe6e6'
          }];
          
        default:
          return [];
      }
    });
  }
} 