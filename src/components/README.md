# HCP UI Components Documentation

This directory contains the Vue components used in the HCP UI application. The components are organized by category.

## Directory Structure

### `common/`
Foundational, reusable components used throughout the application.
- **`BaseCard.vue`**: A general-purpose card container wrapping Element Plus `el-card`. Supports `title` prop and `actions` slot in the header.
- **`BaseTable.vue`**: A configuration-driven table component wrapping `el-table`. Supports dynamic columns, custom slots, and a fixed operation column.
- **`BaseCardButton.vue`**: A standard button component for card headers. Wraps `el-button` to provide consistent styling (primary, secondary, outline, text) and icon support. Designed to be used with `common/BaseCard`'s `#actions` slot.
- **`BaseSegmentedControl.vue`**: An iOS-style segmented control component (wrapping `el-radio-group`) for switching between views or filters. Designed to be used with `common/BaseCard`'s `#actions` slot.

### `cards/`
Specialized card components.
- **`DashboardCard.vue`** (formerly `BaseCard.vue`): An alternative card implementation (using `div` with `ios-card` class) distinct from `common/BaseCard.vue`. Used primarily in dashboard layouts for specific styling requirements (custom CSS-based card).
- **`SettingsCard.vue`**: A card component optimized for settings pages, featuring specific styling for titles and headers.

### `dashboard/`
Components specific to the Dashboard view.
- **`StatCardsGroup.vue`**: A container component that renders a grid of `DashboardMetric` cards.
- **`DashboardMetric.vue`**: Displays a single key performance metric (e.g., TPS, Latency) with label, value, icon, and trend indicator.
- **`StatCard.vue`**: (Empty/Placeholder) Reserved for future statistic card implementation.
- **`MiniChart.vue`**: (Empty/Placeholder) Reserved for small sparkline or trend charts.

### `table/`
- **`ActionTable.vue`**: A table component designed for CRUD operations. Includes slots for header actions (e.g., "Create") and row-level actions, along with pagination support.

### `layout/`
Application shell components.
- **`AppLayout.vue`**: The main layout container that structures the page with sidebar, header, and content area.
- **`AppSidebar.vue`**: The left navigation sidebar.
- **`AppHeader.vue`**: The top header bar containing page title, theme toggle, and user actions.

### `benchmarks/`
Components related to the Benchmark/Testing features.
- **`BenchmarkTable.vue`**: (Empty/Placeholder) Reserved for benchmark results table.
- **`BenchmarkForm.vue`**: (Empty/Placeholder) Reserved for creating/editing benchmark tasks.

## Relationships & Usage

- **Layout**: `AppLayout` composes `AppSidebar` and `AppHeader` to form the base structure of the application.
- **Dashboard**: `StatCardsGroup` iterates over data to render multiple `DashboardMetric` components.
- **Common Usage**: 
  - `common/BaseCard` is the preferred container for general content (Settings, Forms, Lists).
  - `common/BaseCardButton` and `common/BaseSegmentedControl` are explicitly designed to be used within the `#actions` slot of `common/BaseCard` to ensure consistent header styling and alignment.
- **Note on Cards**: 
  - Use `common/BaseCard` for standard Element Plus based cards.
  - Use `cards/DashboardCard` for custom-styled dashboard widgets that require the "iOS Card" visual style but don't need the full Element Plus card features.
