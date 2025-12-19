# Performance Monitoring Guide

## Overview

This document describes the performance monitoring system implemented in the Alens Photography Portfolio application. The system tracks Web Vitals, custom performance metrics, and provides comprehensive monitoring capabilities.

## Features

### Web Vitals Tracking
- **FCP** (First Contentful Paint) - Time until first content is rendered
- **LCP** (Largest Contentful Paint) - Time until largest content element is rendered
- **CLS** (Cumulative Layout Shift) - Visual stability metric
- **TTFB** (Time to First Byte) - Server response time
- **INP** (Interaction to Next Paint) - Overall responsiveness (replaces FID)

### Custom Metrics
- Function execution time
- API call duration
- Component render time
- User interactions
- Custom counters

### Data Storage
- Local storage (browser)
- Console logging (development)
- API endpoint (configurable)

### Dashboard
- Real-time performance metrics
- Historical data visualization
- Export functionality
- Data clearing options

## Architecture

### Core Files

```
src/
├── lib/
│   └── performance-monitor.ts      # Core performance monitoring logic
├── hooks/
│   └── usePerformanceMonitor.ts    # Custom hook for easy integration
└── components/
    └── performance/
        ├── PerformanceTracker.tsx  # Web Vitals integration component
        └── index.ts               # Exports
```

### Performance Monitor API (`src/lib/performance-monitor.ts`)

#### Core Functions

**`trackCustomMetric(name, value, additionalData?)`**
```typescript
import { trackCustomMetric } from '@/lib/performance-monitor'

// Track a simple metric
trackCustomMetric('button_clicks', 1)

// Track with additional data
trackCustomMetric('api_response_time', 250, {
  endpoint: '/api/images',
  status: 200
})
```

**`measureExecutionTime(name, fn, additionalData?)`**
```typescript
import { measureExecutionTime } from '@/lib/performance-monitor'

// Measure synchronous function
const result = measureExecutionTime('data_processing', () => {
  // Your code here
  return processData()
})
```

**`measureAsyncExecutionTime(name, fn, additionalData?)`**
```typescript
import { measureAsyncExecutionTime } from '@/lib/performance-monitor'

// Measure async function
const result = await measureAsyncExecutionTime('api_fetch', async () => {
  const response = await fetch('/api/data')
  return response.json()
})
```

#### Configuration

**`initializePerformanceMonitoring(options)`**
```typescript
import { initializePerformanceMonitoring } from '@/lib/performance-monitor'

initializePerformanceMonitoring({
  reportToConsole: true,        // Log to console
  storeLocally: true,           // Store in localStorage
  sendToApi: '/api/performance', // Send to API endpoint
  customReporters: [myReporter] // Custom reporters
})
```

#### Reporters

**Console Reporter**
```typescript
import { consoleReporter } from '@/lib/performance-monitor'

registerReporter(consoleReporter)
```

**Local Storage Reporter**
```typescript
import { localStorageReporter } from '@/lib/performance-monitor'

registerReporter(localStorageReporter)
```

**API Reporter**
```typescript
import { fetchReporter } from '@/lib/performance-monitor'

registerReporter(fetchReporter('/api/performance'))
```

**Custom Reporter**
```typescript
import { registerReporter } from '@/lib/performance-monitor'

const customReporter = (data) => {
  // Your custom logic
  console.log('Custom report:', data)
}

registerReporter(customReporter)
```

### Custom Hook (`src/hooks/usePerformanceMonitor.ts`)

Provides a convenient way to use performance monitoring in React components.

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

function MyComponent() {
  const {
    trackMetric,
    measureTime,
    measureAsyncTime,
    incrementCounter,
    trackRenderTime,
    trackApiCall,
    trackInteraction,
  } = usePerformanceMonitor()

  // Track a metric
  trackMetric('component_load', Date.now())

  // Measure execution time
  const result = measureTime('expensive_calculation', () => {
    return calculateSomething()
  })

  // Track async operation
  const fetchData = async () => {
    const data = await trackApiCall('get_images', async () => {
      const response = await fetch('/api/images')
      return response.json()
    })
    return data
  }

  // Track user interaction
  const handleClick = () => {
    trackInteraction('button_click', { buttonId: 'submit' })
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  )
}
```

### Performance Tracker Component

Automatically tracks Web Vitals when added to the layout.

```tsx
// In layout.tsx
import { PerformanceTracker } from '@/components/performance'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PerformanceTracker />
        {children}
      </body>
    </html>
  )
}
```

## Usage Examples

### 1. Track API Call Performance

```typescript
import { measureAsyncExecutionTime } from '@/lib/performance-monitor'

const fetchUserData = async (userId: string) => {
  return measureAsyncExecutionTime('api_fetch_user', async () => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }, { userId })
}
```

### 2. Track Component Render Time

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

function MyComponent() {
  const { trackRenderTime } = usePerformanceMonitor()

  // Track render time
  const endTrack = trackRenderTime('MyComponent')

  useEffect(() => {
    return () => endTrack()
  }, [])

  // Component JSX
  return <div>...</div>
}
```

### 3. Track User Interactions

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

function ImageGallery() {
  const { trackInteraction } = usePerformanceMonitor()

  const handleImageClick = (imageId: string) => {
    trackInteraction('image_click', { imageId })
  }

  return (
    <div onClick={() => handleImageClick('123')}>
      <img src="..." />
    </div>
  )
}
```

### 4. Track Custom Business Metrics

```typescript
import { trackCustomMetric } from '@/lib/performance-monitor'

// Track form submissions
const handleFormSubmit = async (data: FormData) => {
  const startTime = Date.now()

  try {
    await submitForm(data)
    trackCustomMetric('form_submission_success', 1, {
      formType: 'contact',
      duration: Date.now() - startTime
    })
  } catch (error) {
    trackCustomMetric('form_submission_error', 1, {
      formType: 'contact',
      error: error.message
    })
  }
}
```

## Performance Dashboard

Access the performance monitoring dashboard at `/admin/performance`.

### Dashboard Features

1. **Summary Tab**
   - Overall performance rating
   - Total metrics collected
   - Breakdown by rating (good/needs-improvement/poor)
   - Metrics by type

2. **Metrics Tab**
   - Web Vitals tracking results
   - Recent metrics (last 20)
   - Metric values and ratings

3. **Details Tab**
   - Complete list of all metrics
   - Timestamp information
   - Export functionality

### Dashboard Actions

- **Refresh Data**: Reload metrics from localStorage
- **Export Data**: Download metrics as JSON file
- **Clear All Data**: Remove all stored performance data

## Performance Thresholds

The system uses the following thresholds for performance ratings:

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP | ≤ 1800ms | 1800-3000ms | > 3000ms |
| LCP | ≤ 2500ms | 2500-4000ms | > 4000ms |
| CLS | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| TTFB | ≤ 800ms | 800-1800ms | > 1800ms |
| INP | ≤ 200ms | 200-500ms | > 500ms |

## Data Structure

### Performance Data Format

```typescript
interface PerformanceData {
  metricName: string    // Name of the metric (e.g., 'LCP', 'api_response_time')
  value: number         // Metric value
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number     // Unix timestamp
  url: string          // Current page URL
  additionalData?: Record<string, any>  // Optional additional metadata
}
```

### Example Data

```json
{
  "metricName": "LCP",
  "value": 2345.67,
  "rating": "needs-improvement",
  "timestamp": 1704067200000,
  "url": "https://example.com/",
  "additionalData": {
    "id": "v4-1234567890",
    "navigationType": "navigate"
  }
}
```

## Best Practices

### 1. Choose Appropriate Metrics
- Track user-critical interactions
- Monitor slow operations (> 100ms)
- Track API calls and database queries

### 2. Use Descriptive Names
```typescript
// Good
trackCustomMetric('api_get_images_by_category', 150)

// Bad
trackCustomMetric('api1', 150)
```

### 3. Add Context
```typescript
// Good
trackCustomMetric('image_upload', duration, {
  imageSize: '2MB',
  imageType: 'JPEG',
  categoryId: '123'
})

// Bad
trackCustomMetric('upload', duration)
```

### 4. Avoid Overhead
- Don't track every single operation
- Sample metrics in high-frequency scenarios
- Use appropriate metric namespacing

### 5. Monitor Performance Impact
- Performance tracking itself should not slow down the app
- Use sampling for high-frequency events
- Consider async tracking for non-critical metrics

## Troubleshooting

### Metrics Not Appearing

1. Check if PerformanceTracker is in the layout
2. Verify localStorage is available
3. Check browser console for errors
4. Ensure data is not being cleared

### Performance Impact

1. Reduce tracking frequency
2. Use sampling for high-volume metrics
3. Consider disabling in production if needed
4. Monitor tracking overhead

### Data Export Issues

1. Check browser download permissions
2. Verify localStorage has data
3. Check file size limitations
4. Try refreshing data

## Integration with Error Monitoring

The performance monitoring system is integrated with the error handling system:

- Errors are automatically tracked
- Performance metrics help identify error causes
- Correlation between errors and performance issues

## Configuration

### Environment Variables

No environment variables required for basic functionality.

### Custom Configuration

Modify `initializePerformanceMonitoring()` calls in:
- `src/components/performance/PerformanceTracker.tsx`
- `src/lib/performance-monitor.ts` (auto-initialization)

### Production Considerations

1. **Data Volume**: LocalStorage has a ~5-10MB limit
2. **Privacy**: Ensure metrics don't contain PII
3. **Performance**: Monitor tracking overhead
4. **Retention**: Implement data rotation/cleanup

## API Integration

To send metrics to an external API endpoint:

```typescript
import { fetchReporter, registerReporter } from '@/lib/performance-monitor'

const apiReporter = fetchReporter('https://api.example.com/performance')
registerReporter(apiReporter)
```

## Performance Budgets

Recommended performance budgets:

- **FCP**: < 1800ms
- **LCP**: < 2500ms
- **CLS**: < 0.1
- **TTFB**: < 800ms
- **INP**: < 200ms

Monitor these budgets through the dashboard and set up alerts when thresholds are exceeded.

## Conclusion

The performance monitoring system provides comprehensive tracking capabilities for the Alens Photography Portfolio application. By following the guidelines in this document, you can effectively monitor and optimize application performance.

For questions or issues, please refer to the project documentation or contact the development team.
