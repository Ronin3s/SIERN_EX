# SIREN - Smart Incident Response & Event Notifier
## Frontend Implementation Guide

### Project Structure

```
client/src/
├── api/
│   ├── api.ts                 # Axios configuration
│   ├── auth.ts                # Authentication endpoints
│   ├── dashboard.ts           # Dashboard data (mock)
│   ├── processes.ts           # Process monitoring (mock)
│   ├── scanner.ts             # File integrity scanning (mock)
│   ├── iocHunt.ts             # IOC hunting (mock)
│   ├── behavioral.ts          # Behavioral detection (mock)
│   └── response.ts            # Response center (mock)
├── components/
│   ├── Header.tsx             # Top navigation bar
│   ├── Sidebar.tsx            # Left sidebar navigation
│   ├── Layout.tsx             # Main layout wrapper
│   ├── Footer.tsx             # Bottom footer
│   ├── ProcessDetailsPanel.tsx # Process details side panel
│   ├── ProtectedRoute.tsx      # Route protection
│   └── ui/                    # shadcn/ui components
├── pages/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── ProcessMonitor.tsx     # Process monitoring page
│   ├── IntegrityScanner.tsx   # File integrity scanning
│   ├── IOCHunt.tsx            # IOC hunting page
│   ├── BehavioralDetection.tsx # Anomaly detection
│   ├── ResponseCenter.tsx     # Containment actions
│   ├── Settings.tsx           # User settings
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   └── BlankPage.tsx          # 404 page
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── hooks/
│   ├── useToast.ts            # Toast notifications
│   └── useMobile.tsx          # Mobile detection
├── lib/
│   └── utils.ts               # Utility functions
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
└── vite-env.d.ts              # Vite types
```

### Key Features Implemented

#### 1. Dashboard (`/`)
- Real-time system statistics
- Active processes count
- Alerts in last 24 hours
- Last scan timestamp
- System status indicator
- Recent alerts feed with severity color coding

#### 2. Process Monitor (`/processes`)
- Real-time process table with sorting
- Search functionality
- Auto-refresh toggle (5-second intervals)
- Manual refresh button
- Process details side panel
- Kill process with confirmation dialog
- Export to CSV
- Risk score color coding (Low/Medium/High)

#### 3. Integrity Scanner (`/scanner`)
- Configurable scan paths
- Preset buttons for common paths
- Include subdirectories toggle
- Compare against baseline toggle
- Real-time scan progress
- Tabbed results view (All/Modified/New/Deleted)
- File change details
- Export scan report

#### 4. IOC Hunt (`/ioc-hunt`)
- Multi-line IOC input
- Paste from clipboard functionality
- Search scope selector (Processes/Filesystem/Network/All)
- Real-time hunt progress
- Results table with confidence scores
- Severity indicators
- Export hunt results

#### 5. Behavioral Detection (`/behavioral`)
- Detected anomalies table
- Rule management interface
- Simulation mode for testing rules
- Severity color coding
- Status indicators (Active/Resolved/Simulated)
- Rule details and descriptions

#### 6. Response Center (`/response`)
- Active containments view
- Action history timeline
- Undo functionality for actions
- User attribution
- Result status (Success/Failed)
- Audit trail

#### 7. Settings (`/settings`)
- General settings (auto-refresh, row density, export format)
- Notification preferences
- Advanced settings (rule sensitivity)
- Reset to defaults
- Save settings

### Design Features

#### Color Scheme
- **Primary**: Blue (#0066FF) to Cyan (#00D9FF) gradient
- **Severity Colors**:
  - Critical: Red (#EF4444)
  - High: Orange (#F97316)
  - Medium: Yellow (#EAB308)
  - Low: Green (#22C55E)
  - Info: Blue (#3B82F6)

#### Visual Effects
- Frosted glass effect (backdrop blur)
- Gradient backgrounds
- Smooth animations (Framer Motion)
- Hover effects on interactive elements
- Loading spinners
- Progress bars
- Toast notifications

#### Typography
- Readable text with proper contrast
- Hierarchical font sizes
- Monospace for technical data (paths, hashes, IPs)
- Clear visual hierarchy

### Mock Data Structure

All mock data is located in `client/src/api/` folder with the following structure:

```typescript
// Description: What the endpoint does
// Endpoint: HTTP_METHOD /api/path
// Request: { field: type, ... }
// Response: { field: type, ... }
export const functionName = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, delayMs);
  });
};
```

### Navigation

**Sidebar Navigation Items:**
1. Dashboard (home icon)
2. Process Monitor (activity icon)
3. Integrity Scanner (shield icon)
4. IOC Hunt (search icon)
5. Behavioral Detection (alert triangle icon)
6. Response Center (zap icon)
7. Settings (settings icon)

**Header Elements:**
- SIREN logo and branding
- System status indicator
- Current time
- Alert bell with unread count
- Theme toggle
- Logout button

### Responsive Design

- **Desktop**: Full sidebar + main content
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu (future enhancement)

### Performance Optimizations

- Lazy loading of components
- Debounced search inputs
- Memoized components
- Efficient re-renders with React hooks
- Smooth animations at 60fps

### Error Handling

- Try-catch blocks in all API calls
- Toast notifications for errors
- User-friendly error messages
- Retry functionality
- Graceful degradation

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Focus indicators

### Future Enhancements

1. Real backend API integration
2. WebSocket for real-time updates
3. Advanced charting with Recharts
4. Export to PDF functionality
5. Mobile responsive design
6. Dark mode refinements
7. User preferences persistence
8. Advanced filtering and search
9. Bulk actions
10. Custom dashboards

### Dependencies

- **React**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Recharts**: Data visualization

### Running the Application

```bash
# Install dependencies
cd client && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

### API Integration Notes

When integrating with the backend:

1. Replace mock data in `client/src/api/` files with actual API calls
2. Uncomment the axios calls in each API function
3. Update endpoint URLs to match backend routes
4. Handle authentication tokens (already configured in `api.ts`)
5. Implement proper error handling
6. Add loading states for long-running operations

### Testing

Mock data is designed to simulate realistic scenarios:
- Process data includes various risk scores
- Scan results show different change types
- IOC hunt results have varying confidence levels
- Anomalies include different severity levels
- Response actions show success and failure cases

All interactions are fully functional with mock data for testing UI/UX before backend integration.