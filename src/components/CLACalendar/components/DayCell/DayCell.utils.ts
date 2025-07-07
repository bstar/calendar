import { parseISO, isValid } from '../../../../utils/DateUtils';
import { RestrictionConfig, RestrictedBoundaryRestriction } from '../../../CLACalendarComponents/restrictions/types';

export function hasAnyBoundaryRestriction(restrictionConfig?: RestrictionConfig) {
  const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };
  return currentRestrictionConfig.restrictions.some(r =>
    r.type === 'restricted_boundary' && r.enabled
  );
}

export function isAnchorInAnyBoundary(anchor: Date, restrictionConfig?: RestrictionConfig) {
  const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };

  // Look for boundary restrictions
  for (const restriction of currentRestrictionConfig.restrictions) {
    if (restriction.type !== 'restricted_boundary' || !restriction.enabled) continue;

    // Safe cast to access ranges
    const boundaryWithRanges = restriction as RestrictedBoundaryRestriction;
    if (boundaryWithRanges.ranges) {
      for (const range of boundaryWithRanges.ranges) {
        const rangeStart = parseISO(range.start);
        const rangeEnd = parseISO(range.end);

        if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

        // Check if anchor is in this boundary
        if (anchor >= rangeStart && anchor <= rangeEnd) {
          return {
            inBoundary: true,
            boundaryStart: rangeStart,
            boundaryEnd: rangeEnd,
            message: range.message || 'Selection must stay within the boundary'
          };
        }
      }
    }
  }

  return { inBoundary: false, boundaryStart: null, boundaryEnd: null, message: null };
}

export function isDateInAnyBoundary(checkDate: Date, restrictionConfig?: RestrictionConfig) {
  const currentRestrictionConfig = restrictionConfig ?? { restrictions: [] };

  // Look for boundary restrictions
  for (const restriction of currentRestrictionConfig.restrictions) {
    if (restriction.type !== 'restricted_boundary' || !restriction.enabled) continue;

    // Safe cast to access ranges
    const boundaryWithRanges = restriction as RestrictedBoundaryRestriction;
    if (boundaryWithRanges.ranges) {
      for (const range of boundaryWithRanges.ranges) {
        const rangeStart = parseISO(range.start);
        const rangeEnd = parseISO(range.end);

        if (!isValid(rangeStart) || !isValid(rangeEnd)) continue;

        // Check if date is in this boundary
        if (checkDate >= rangeStart && checkDate <= rangeEnd) {
          return true;
        }
      }
    }
  }

  return false;
}

export function isInSameBoundary(checkDate: Date, boundaryStart: Date | null, boundaryEnd: Date | null) {
  if (!boundaryStart || !boundaryEnd) return false;
  return checkDate >= boundaryStart && checkDate <= boundaryEnd;
}