# Strategy Editing API Endpoints

This document describes the backend API endpoints required to support manual strategy editing functionality in the frontend.

## Overview

The strategy editing feature allows users to manually adjust an optimization strategy after it has been generated. Users can:
- Change the provider for each process step
- Adjust scheduling times for each step
- Validate changes before saving
- View alternative provider options

All processes must remain sequential - each step must start after the previous step completes.

---

## Endpoints

### 1. Get Alternative Providers for a Step

**Endpoint:** `POST /api/strategies/{strategyId}/steps/{stepId}/alternative-providers`

**Description:** Retrieves alternative provider options for a specific process step, including their estimates and available schedules. **Important:** The response includes the current provider as one of the alternatives, allowing users to compare it with other options.

**Request Body:**
```json
{
  "scheduleStartTime": "2026-02-15T00:00:00Z",  // Start of schedule viewing window
  "scheduleEndTime": "2026-02-22T23:59:59Z",    // End of schedule viewing window
  "requestedStartTime": "2026-02-15T08:00:00Z"  // Optional: specific process start time
}
```

**Response (200 OK):**
```json
{
  "alternatives": [
    {
      "providerId": "prov-123",
      "providerName": "Precision CNC Corp",
      "estimate": {
        "cost": 650.00,
        "qualityScore": 0.92,
        "emissionsKgCO2": 18.5,
        "duration": 10.0
      },
      "schedule": {
        "startTime": "2026-02-15T08:00:00Z",
        "endTime": "2026-02-17T18:00:00Z",
        "segments": [
          {
            "startTime": "2026-02-15T08:00:00Z",
            "endTime": "2026-02-15T12:00:00Z",
            "segmentType": "WorkingTime"
          },
          {
            "startTime": "2026-02-15T12:00:00Z",
            "endTime": "2026-02-15T13:00:00Z",
            "segmentType": "Break"
          },
          {
            "startTime": "2026-02-15T13:00:00Z",
            "endTime": "2026-02-15T17:00:00Z",
            "segmentType": "WorkingTime"
          },
          {
            "startTime": "2026-02-16T08:00:00Z",
            "endTime": "2026-02-16T17:00:00Z",
            "segmentType": "WorkingTime"
          }
        ]
      }
    }
  ]
}
```

**Notes:**
- The alternatives array **includes the current provider** for comparison purposes
- Frontend identifies current provider by matching `providerId` with `step.selectedProviderId`
- Current provider is visually highlighted in the UI with a "Current" badge
- Alternatives are sorted with current provider displayed first

**Error Responses:**
- `404`: Step not found
- `400`: Invalid request parameters

---

### 2. Validate Process Time on Provider Schedule

**Endpoint:** `POST /api/strategies/{strategyId}/steps/{stepId}/validate-time`

**Description:** Validates if a specific process can be scheduled at the requested start time on the provider's schedule. Returns the validated schedule with the process overlay showing working time, breaks, and the process execution period.

**Request Body:**
```json
{
  "providerId": "string",
  "processType": "string",
  "requestedStartTime": "2026-02-15T08:30:00Z",
  "estimatedDuration": 8.5
}
```

**Response (200 OK):**
```json
{
  "isValid": true,
  "validatedSchedule": {
    "startTime": "2026-02-15T08:00:00Z",
    "endTime": "2026-02-16T18:00:00Z",
    "segments": [
      {
        "startTime": "2026-02-15T08:00:00Z",
        "endTime": "2026-02-15T08:30:00Z",
        "segmentType": "WorkingTime"
      },
      {
        "startTime": "2026-02-15T08:30:00Z",
        "endTime": "2026-02-15T12:00:00Z",
        "segmentType": "ProcessExecution"
      },
      {
        "startTime": "2026-02-15T12:00:00Z",
        "endTime": "2026-02-15T13:00:00Z",
        "segmentType": "Break"
      },
      {
        "startTime": "2026-02-15T13:00:00Z",
        "endTime": "2026-02-15T17:00:00Z",
        "segmentType": "ProcessExecution"
      },
      {
        "startTime": "2026-02-15T17:00:00Z",
        "endTime": "2026-02-15T18:00:00Z",
        "segmentType": "WorkingTime"
      },
      {
        "startTime": "2026-02-16T08:00:00Z",
        "endTime": "2026-02-16T09:30:00Z",
        "segmentType": "ProcessExecution"
      },
      {
        "startTime": "2026-02-16T09:30:00Z",
        "endTime": "2026-02-16T18:00:00Z",
        "segmentType": "WorkingTime"
      }
    ]
  },
  "errors": [],
  "warnings": []
}
```

**Response when invalid (200 OK with isValid: false):**
```json
{
  "isValid": false,
  "errors": [
    "Process would extend beyond provider's working hours",
    "Requested time conflicts with existing booking"
  ],
  "warnings": []
}
```

**Validation Logic:**
- Process must start during provider's working hours
- Process duration (accounting for breaks) must fit within available schedule
- Process should not conflict with provider's commitments
- Segments of type "ProcessExecution" show when the process will be actively worked on
- Duration is in hours and excludes break periods

**Error Responses:**
- `404`: Strategy or step not found
- `400`: Invalid request parameters

---

### 3. Update Strategy

**Endpoint:** `PUT /api/optimization-requests/{requestId}/strategies/{strategyId}`

**Description:** Applies manual changes to a strategy, recalculates metrics, and persists the updated strategy.

**Request Body:**
```json
{
  "strategyId": "string",
  "updates": [
    {
      "stepId": "string",
      "newProviderId": "string",       // Optional
      "newStartTime": "string",        // Optional: ISO 8601 datetime
      "newEndTime": "string"           // Optional: ISO 8601 datetime
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "updatedStrategy": {
    "id": "string",
    "planId": "string",
    "strategyName": "string (Modified)",
    "priority": "string",
    "workflowType": "string",
    "steps": [
      {
        "id": "string",
        "stepNumber": 1,
        "process": "CNC Machining",
        "selectedProviderId": "string",
        "selectedProviderName": "string",
        "estimate": {
          "id": "string",
          "cost": 650.00,
          "qualityScore": 0.92,
          "emissionsKgCO2": 18.5,
          "duration": 10.0
        },
        "allocatedSchedule": {
          "startTime": "2026-02-15T08:00:00Z",
          "endTime": "2026-02-15T18:00:00Z",
          "segments": [
            {
              "startTime": "2026-02-15T08:00:00Z",
              "endTime": "2026-02-15T12:00:00Z",
              "segmentType": "WorkingTime"
            },
            {
              "startTime": "2026-02-15T12:00:00Z",
              "endTime": "2026-02-15T13:00:00Z",
              "segmentType": "Break"
            },
            {
              "startTime": "2026-02-15T13:00:00Z",
              "endTime": "2026-02-15T18:00:00Z",
              "segmentType": "WorkingTime"
            }
          ]
        }
      }
    ],
    "metrics": {
      "id": "string",
      "totalCost": 2500.00,
      "totalDuration": "PT48H",
      "averageQuality": 0.90,
      "totalEmissionsKgCO2": 75.0,
      "solverStatus": "Manual",
      "objectiveValue": 0.0
    },
    "warranty": {
      "level": "string",
      "durationMonths": 12,
      "includesInsurance": true,
      "description": "string"
    },
    "description": "Manually modified strategy"
  },
  "validationErrors": [],              // Empty if successful
  "warnings": [
    "Total cost increased by €120 compared to original strategy"
  ]
}
```

**Backend Processing:**
1. Validate all changes
2. Update step configurations with new providers/times
3. Recalculate provider schedules with breaks
4. Recalculate strategy metrics (cost, quality, emissions, duration)
5. Mark strategy as manually modified
6. Persist changes to database
7. Return updated strategy

**Error Responses:**
- `404`: Strategy or request not found
- `400`: Validation failed (errors in response body)
- `409`: Strategy has already been executed and cannot be modified

---

## Data Models

### ProcessStep (Updated)
```typescript
{
  "id": "string",
  "stepNumber": 1,
  "process": "string",
  "selectedProviderId": "string",
  "selectedProviderName": "string",
  "estimate": {
    "id": "string",
    "cost": number,
    "qualityScore": number,
    "emissionsKgCO2": number,
    "duration": number
  },
  "allocatedSchedule": {
    "startTime": "ISO 8601 datetime",
    "endTime": "ISO 8601 datetime",
    "segments": [
      {
        "startTime": "ISO 8601 datetime",
        "endTime": "ISO 8601 datetime",
        "segmentType": "WorkingTime | Break"
      }
    ]
  }
}
```

### OptimizationMetrics (Updated)
```typescript
{
  "id": "string",
  "totalCost": number,
  "totalDuration": "ISO 8601 duration",
  "averageQuality": number,
  "totalEmissionsKgCO2": number,
  "solverStatus": "Optimal | Feasible | Infeasible | Manual",
  "objectiveValue": number
}
```

---

## Implementation Notes

### Sequential Processing Validation
The backend must ensure that when validating or saving changes:
1. Sort all steps by `stepNumber`
2. For each step (except the first):
   - Verify `step[i].startTime >= step[i-1].endTime`
   - If validation fails, add error message with specific step numbers

### Provider Availability
When fetching alternative providers or validating changes:
1. Check provider's `processCapabilities` for the required process type
2. Query provider's schedule for available time slots
3. Consider provider's break periods when calculating actual working time
4. Ensure provider has sufficient capacity

### Metrics Recalculation
When a strategy is updated:
1. Sum up all step costs for `totalCost`
2. Calculate average of all quality scores for `averageQuality`
3. Sum up all emissions for `totalEmissionsKgCO2`
4. Calculate `totalDuration` from first step start to last step end (ISO 8601 duration format)
5. Set `solverStatus` to "Manual"
6. Set `objectiveValue` to 0.0 (not applicable for manual edits)

### Strategy Versioning (Optional Enhancement)
Consider implementing strategy versioning to track changes:
- Store original strategy reference
- Create new strategy record for modified version
- Link modified strategy to original for audit trail
- Allow reverting to original strategy

---

## Frontend Mock Implementation

The frontend currently uses mock data in [`strategyEditApi.ts`](../src/hooks/api/strategyEditApi.ts). 

Key features of the mock:
- Simulated API delays (500-1500ms)
- Generated alternative providers with realistic data
- Basic sequential validation
- Warning messages indicating mock mode

To integrate with real backend:
1. Replace `await delay(...)` with actual `fetch()` calls
2. Uncomment the fetch implementation code
3. Remove mock data generation
4. Update API URLs to match your backend routes

---

## Testing Checklist

Backend implementation should be tested for:

- [ ] Alternative providers are correctly filtered by process type
- [ ] Time slots don't overlap with provider's existing schedule
- [ ] Sequential validation correctly identifies timing conflicts
- [ ] Metrics are accurately recalculated after changes
- [ ] Break periods are correctly inserted in schedules
- [ ] Invalid provider selections are rejected
- [ ] Strategy cannot be modified if already executed
- [ ] Concurrent modifications are handled correctly
- [ ] Large strategies (>10 steps) perform adequately

---

## Example Workflow

1. User views confirmed plan at `/plan/{requestId}`
2. User clicks "Edit Strategy" button
3. Frontend navigates to `/plan/{requestId}/edit`
4. Frontend loads plan and displays StrategyEditor component
5. User expands a step and clicks "View Alternative Providers"
6. Frontend calls `POST /api/strategies/{strategyId}/steps/{stepId}/alternative-providers`
7. User selects a different provider
8. User adjusts start/end times
9. User clicks "Save Changes"
10. Frontend calls `PUT /api/optimization-requests/{requestId}/strategies/{strategyId}`
11. Backend recalculates metrics and returns updated strategy
12. Frontend navigates back to `/plan/{requestId}` showing updated strategy

---

## Questions for Backend Team

1. Should we create a new strategy record or modify the existing one?
2. Do we need to track modification history/audit trail?
3. Should there be a limit on how many times a strategy can be modified?
4. What happens if a provider becomes unavailable after initial selection?
5. Should we lock strategies from editing once execution begins?
6. Do we need role-based permissions for strategy editing?
