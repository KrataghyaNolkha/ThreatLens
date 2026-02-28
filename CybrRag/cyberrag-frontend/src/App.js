// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CyberRAGLanding from './components/CyberRAGLanding';
import PremiumDashboard from './components/PremiumDashboard';
import LogAnalysis from './components/LogAnalysis';
import MitreExplorer from './components/MitreExplorer';
import Sidebar from './components/Sidebar';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF6B4A' },
    secondary: { main: '#4A9EFF' },
    background: {
      default: '#0B0E17',
      paper: '#141A24',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: { borderRadius: 8 },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<CyberRAGLanding />} />
          <Route
            path="/*"
            element={
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                  <Routes>
                    <Route path="/dashboard" element={<PremiumDashboard />} />
                    <Route path="/analyze" element={<LogAnalysis />} />
                    <Route path="/mitre" element={<MitreExplorer />} />
                  </Routes>
                </Box>
              </Box>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;