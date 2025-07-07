#!/usr/bin/env python3
"""
Script to update CLACalendar.tsx imports and remove duplicate components
"""

import re

# Read the file
with open('src/components/CLACalendar.tsx', 'r') as f:
    content = f.read()

# Find the import section end (before the getFontSize comment)
import_end = content.find('// Font size utility function')

# Extract the import section
import_section = content[:import_end]

# Add new imports before the getFontSize comment
new_imports = """
// Import new extracted components
import { Card } from './CLACalendar/components/Card';
import { DayCell } from './CLACalendar/components/DayCell';
import { MonthGrid } from './CLACalendar/components/MonthGrid';
import { CalendarGrid } from './CLACalendar/components/CalendarGrid';
import { LayerControl } from './CLACalendar/components/LayerControl';
import { getFontSize, isSameMonth } from './CLACalendar/utils/calendar.utils';
import type { CLACalendarProps as ExtractedCLACalendarProps, RenderResult, Renderer } from './CLACalendar/CLACalendar.types';

"""

# Update imports section
updated_imports = import_section + new_imports

# Find where to start keeping content (after the duplicate components)
# Look for the measurementCache which comes after CalendarGrid
measurement_cache_start = content.find('// Add this outside the component to cache measurements')
if measurement_cache_start == -1:
    measurement_cache_start = content.find('const measurementCache = {')

# Remove getFontSize function
content_after_imports = content[import_end:]
get_font_size_end = content_after_imports.find('};', content_after_imports.find('const getFontSize =')) + 2
content_after_imports = content_after_imports[get_font_size_end:]

# Remove duplicate type definitions and components
# Remove Card-related interfaces and implementation
card_props_start = content_after_imports.find('// Add these interfaces after the existing ones')
card_component_end = content_after_imports.find('};', content_after_imports.find('Card.Footer = (')) + 2
content_after_imports = (content_after_imports[:card_props_start] + 
                        content_after_imports[card_component_end:])

# Remove Input component but keep InputProps
input_props_match = re.search(r'(interface InputProps[^}]+})', content_after_imports)
input_props = input_props_match.group(1) if input_props_match else ''

# Remove the Renderer interface (it's in our types file)
renderer_start = content_after_imports.find('// Add these type definitions')
renderer_end = content_after_imports.find('}', content_after_imports.find('interface Renderer')) + 1
content_after_imports = (content_after_imports[:renderer_start] + 
                        input_props + '\n\n' +
                        content_after_imports[renderer_end:])

# Remove isSameMonth function
is_same_month_start = content_after_imports.find('/**\n * A reliable implementation of isSameMonth')
is_same_month_end = content_after_imports.find('};', is_same_month_start) + 2
content_after_imports = (content_after_imports[:is_same_month_start] + 
                        content_after_imports[is_same_month_end:])

# Remove all the duplicate components (MonthGrid, DayCell, MonthPair, LayerControl, CalendarGrid)
# Find where measurementCache starts
measurement_idx = content_after_imports.find('// Add this outside the component to cache measurements')
if measurement_idx == -1:
    measurement_idx = content_after_imports.find('const measurementCache = {')

# Remove everything from MonthGrid to just before measurementCache
month_grid_start = content_after_imports.find('// Update the MonthGrid to use proper types for weeks')
if month_grid_start != -1 and measurement_idx != -1:
    content_after_imports = (content_after_imports[:month_grid_start] + 
                            '\n' +
                            content_after_imports[measurement_idx:])

# Keep the CLACalendarProps interface but rename it if needed
# (Actually, the one in the file is different from what we exported, so keep it)

# Combine everything
final_content = updated_imports + content_after_imports

# Write the updated file
with open('src/components/CLACalendar.updated.tsx', 'w') as f:
    f.write(final_content)

print("Updated file written to src/components/CLACalendar.updated.tsx")
print("Please review the changes before replacing the original file")