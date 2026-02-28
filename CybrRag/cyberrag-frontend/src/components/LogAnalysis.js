// src/components/LogAnalysis.js
import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  alpha,
  Fade,
  Zoom,
  Badge,
  Tabs,
  Tab,
  Rating,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  ContentCopy as ContentCopyIcon,
  BugReport as BugReportIcon,
  LocalPolice as LocalPoliceIcon,
  Public as PublicIcon,
  Computer as ComputerIcon,
  Flag as FlagIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Biotech as BiotechIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Map as MapIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { analyzeLog } from '../services/api';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const colors = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  accent: '#db2777',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  purple: '#7c3aed',
  teal: '#0d9488',
  background: '#f8fafc',
  surface: '#ffffff',
  elevated: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
};

const LogAnalysis = () => {
  const [logInput, setLogInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mapView, setMapView] = useState('standard');

  const sampleLogs = [
    {
      label: 'PowerShell',
      log: 'EventID: 4688 User: admin Process: powershell.exe CommandLine: powershell -enc aw52b2tlLw1hbG1jaW91cw== SourceIP: 203.55.77.99',
      color: colors.purple,
    },
    {
      label: 'Failed Login',
      log: 'EventID: 4625 User: admin SourceIP: 203.55.77.99 Status: Failed Login',
      color: colors.error,
    },
    {
      label: 'Brute Force',
      log: 'EventID: 4625 User: unknown SourceIP: 45.155.205.233 Status: Failed Login x5',
      color: colors.warning,
    },
  ];

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeLog(logInput);
      setResult(data);
    } catch (err) {
      setError('Failed to analyze log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLogInput('');
    setResult(null);
    setError(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
  };

  const getSeverityColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return colors.error;
      case 'HIGH': return colors.warning;
      case 'MEDIUM': return colors.info;
      case 'LOW': return colors.success;
      default: return colors.primary;
    }
  };

  // Mock IP data for map
  const mockIpData = {
    '203.55.77.99': { lat: -31.9505, lng: 115.8605, city: 'Perth', country: 'Australia' },
    '45.155.205.233': { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France' },
    '8.8.8.8': { lat: 37.422, lng: -122.084, city: 'Mountain View', country: 'USA' },
  };

  const getIpLocation = (ip) => {
    return mockIpData[ip] || { lat: 0, lng: 0, city: 'Unknown', country: 'Unknown' };
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
          borderRadius: 0,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700, mb: 1 }}>
              Log Analysis
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Analyze security logs with AI-powered threat detection
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Download Sample">
                <IconButton sx={{ bgcolor: colors.surface, border: `1px solid ${alpha(colors.textSecondary, 0.2)}` }}>
                  <DownloadIcon sx={{ color: colors.textSecondary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton sx={{ bgcolor: colors.surface, border: `1px solid ${alpha(colors.textSecondary, 0.2)}` }}>
                  <ShareIcon sx={{ color: colors.textSecondary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Options">
                <IconButton sx={{ bgcolor: colors.surface, border: `1px solid ${alpha(colors.textSecondary, 0.2)}` }}>
                  <MoreVertIcon sx={{ color: colors.textSecondary }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ px: 3 }}>
        {/* Input Section */}
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                bgcolor: colors.surface,
                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                borderRadius: 3,
                boxShadow: `0 4px 6px -1px ${alpha(colors.text, 0.05)}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: colors.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge
                    color="primary"
                    variant="dot"
                    sx={{ '& .MuiBadge-badge': { bgcolor: colors.success } }}
                  >
                    <UploadIcon sx={{ color: colors.primary }} />
                  </Badge>
                  Input Security Log
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Paste Windows Event Log, Linux Syslog, or any security log..."
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha(colors.background, 0.5),
                      '& fieldset': {
                        borderColor: alpha(colors.primary, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: colors.primary,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: colors.text,
                    },
                  }}
                />

                <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  {sampleLogs.map((sample, index) => (
                    <Zoom in key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Chip
                        label={sample.label}
                        onClick={() => setLogInput(sample.log)}
                        sx={{
                          bgcolor: alpha(sample.color, 0.05),
                          color: sample.color,
                          border: `1px solid ${alpha(sample.color, 0.2)}`,
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: alpha(sample.color, 0.15),
                          },
                        }}
                      />
                    </Zoom>
                  ))}
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={loading || !logInput.trim()}
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      flex: 2,
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      boxShadow: `0 4px 14px 0 ${alpha(colors.primary, 0.3)}`,
                      py: 1.5,
                    }}
                  >
                    Analyze Log
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    size="large"
                    startIcon={<ClearIcon />}
                    sx={{
                      flex: 1,
                      borderColor: alpha(colors.textSecondary, 0.3),
                      color: colors.textSecondary,
                      '&:hover': {
                        borderColor: colors.error,
                        color: colors.error,
                        bgcolor: alpha(colors.error, 0.05),
                      },
                    }}
                  >
                    Clear
                  </Button>
                </Stack>

                {loading && (
                  <Box sx={{ mt: 3 }}>
                    <LinearProgress
                      sx={{
                        bgcolor: alpha(colors.primary, 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 1, textAlign: 'center' }}>
                      Analyzing with AI models...
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Fade in>
                    <Alert
                      severity="error"
                      sx={{ mt: 3, bgcolor: alpha(colors.error, 0.05), color: colors.error }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={7}>
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    bgcolor: colors.surface,
                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                    borderRadius: 3,
                    boxShadow: `0 10px 15px -3px ${alpha(colors.text, 0.05)}`,
                  }}
                >
                  <CardContent>
                    {/* Results Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: colors.success }} />
                        Analysis Complete
                      </Typography>
                      <Tooltip title="Copy Results">
                        <IconButton onClick={() => copyToClipboard(result)} sx={{ color: colors.textSecondary }}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Tabs - Updated with AI Summary */}
                    <Tabs
                      value={activeTab}
                      onChange={(e, v) => setActiveTab(v)}
                      sx={{
                        mb: 3,
                        '& .MuiTab-root': { color: colors.textSecondary },
                        '& .Mui-selected': { color: colors.primary },
                        '& .MuiTabs-indicator': { bgcolor: colors.primary },
                      }}
                    >
                      <Tab label="Overview" />
                      <Tab label="Threat Details" />
                      <Tab label="Intelligence" />
                      <Tab label="AI Summary" />
                      <Tab label="Map" />
                    </Tabs>

                    {/* Tab Panels */}
                    <AnimatePresence mode="wait">
                      {activeTab === 0 && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Grid container spacing={2}>
                            {/* Risk Level */}
                            <Grid item xs={12} md={6}>
                              <Paper
                                sx={{
                                  p: 2,
                                  bgcolor: alpha(getSeverityColor(result.risk_assessment?.risk_level), 0.05),
                                  border: `1px solid ${alpha(getSeverityColor(result.risk_assessment?.risk_level), 0.2)}`,
                                  borderRadius: 2,
                                  elevation: 0,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                  Risk Level
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h3" sx={{ color: getSeverityColor(result.risk_assessment?.risk_level) }}>
                                    {result.risk_assessment?.risk_score}
                                  </Typography>
                                  <Chip
                                    label={result.risk_assessment?.risk_level}
                                    sx={{
                                      bgcolor: alpha(getSeverityColor(result.risk_assessment?.risk_level), 0.1),
                                      color: getSeverityColor(result.risk_assessment?.risk_level),
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Paper>
                            </Grid>

                            {/* Detection */}
                            <Grid item xs={12} md={6}>
                              <Paper
                                sx={{
                                  p: 2,
                                  bgcolor: alpha(result.detection_result?.threat_detected ? colors.error : colors.success, 0.05),
                                  border: `1px solid ${alpha(result.detection_result?.threat_detected ? colors.error : colors.success, 0.2)}`,
                                  borderRadius: 2,
                                  elevation: 0,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                  Threat Detection
                                </Typography>
                                <Typography variant="h6" sx={{ color: result.detection_result?.threat_detected ? colors.error : colors.success }}>
                                  {result.detection_result?.threat_detected || 'No Threat Detected'}
                                </Typography>
                                {result.detection_result?.confidence && (
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Confidence: {(result.detection_result.confidence * 100).toFixed(0)}%
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>

                            {/* Parsed Log */}
                            <Grid item xs={12}>
                              <Paper sx={{ p: 2, bgcolor: alpha(colors.info, 0.05), border: `1px solid ${alpha(colors.info, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                                <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 2 }}>
                                  Parsed Log Details
                                </Typography>
                                <Grid container spacing={2}>
                                  {Object.entries(result.parsed_log || {}).map(([key, value]) => (
                                    key !== 'raw' && (
                                      <Grid item xs={6} md={4} key={key}>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                          {key.replace('_', ' ').toUpperCase()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                          {value || 'N/A'}
                                        </Typography>
                                      </Grid>
                                    )
                                  ))}
                                </Grid>
                              </Paper>
                            </Grid>
                          </Grid>
                        </motion.div>
                      )}

                      {activeTab === 1 && (
                        <motion.div
                          key="threat"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Stack spacing={2}>
                            {/* MITRE Technique */}
                            {result.mitre_details && (
                              <Paper sx={{ p: 2, bgcolor: alpha(colors.purple, 0.05), border: `1px solid ${alpha(colors.purple, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <LocalPoliceIcon sx={{ color: colors.purple }} />
                                  <Typography variant="subtitle2" sx={{ color: colors.purple }}>
                                    MITRE ATT&CK Technique
                                  </Typography>
                                </Box>
                                <Chip
                                  label={result.mitre_details.id}
                                  size="small"
                                  sx={{ bgcolor: alpha(colors.purple, 0.1), color: colors.purple, mb: 1, fontWeight: 500 }}
                                />
                                <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1 }}>
                                  {result.mitre_details.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                  {result.mitre_details.description}
                                </Typography>
                              </Paper>
                            )}

                            {/* CVEs */}
                            {result.related_cves && result.related_cves.length > 0 && (
                              <Paper sx={{ p: 2, bgcolor: alpha(colors.error, 0.05), border: `1px solid ${alpha(colors.error, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <BugReportIcon sx={{ color: colors.error }} />
                                  <Typography variant="subtitle2" sx={{ color: colors.error }}>
                                    Related CVEs
                                  </Typography>
                                </Box>
                                {result.related_cves.map((cve, index) => (
                                  <Box key={index} sx={{ mb: index < result.related_cves.length - 1 ? 2 : 0 }}>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                      {cve.cve_id} {cve.cvss_score && `(CVSS: ${cve.cvss_score})`}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                      {cve.description}
                                    </Typography>
                                  </Box>
                                ))}
                              </Paper>
                            )}
                          </Stack>
                        </motion.div>
                      )}

                      {activeTab === 2 && (
                        <motion.div
                          key="intel"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          {result.ip_intelligence && (
                            <Paper sx={{ p: 2, bgcolor: alpha(colors.teal, 0.05), border: `1px solid ${alpha(colors.teal, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <PublicIcon sx={{ color: colors.teal }} />
                                <Typography variant="subtitle2" sx={{ color: colors.teal }}>
                                  IP Intelligence
                                </Typography>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(colors.teal, 0.1), color: colors.teal }}>
                                      <ComputerIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                        IP Address
                                      </Typography>
                                      <Typography variant="h6" sx={{ color: colors.text }}>
                                        {result.ip_intelligence.ip}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>

                                {result.ip_intelligence.geo && (
                                  <>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                        Country
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FlagIcon sx={{ fontSize: 16, color: colors.teal }} />
                                        <Typography variant="body2" sx={{ color: colors.text }}>
                                          {result.ip_intelligence.geo.country}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                        City
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationIcon sx={{ fontSize: 16, color: colors.teal }} />
                                        <Typography variant="body2" sx={{ color: colors.text }}>
                                          {result.ip_intelligence.geo.city}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                                        ISP
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: colors.text }}>
                                        {result.ip_intelligence.geo.isp}
                                      </Typography>
                                    </Grid>
                                  </>
                                )}

                                {result.ip_intelligence.reputation && (
                                  <Grid item xs={12}>
                                    <Divider sx={{ my: 2, borderColor: alpha(colors.teal, 0.1) }} />
                                    <Typography variant="subtitle2" sx={{ color: colors.teal, mb: 2 }}>
                                      Reputation Score
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                      <Chip
                                        label={`Malicious: ${result.ip_intelligence.reputation.malicious}`}
                                        size="small"
                                        sx={{ bgcolor: alpha(colors.error, 0.1), color: colors.error, fontWeight: 500 }}
                                      />
                                      <Chip
                                        label={`Suspicious: ${result.ip_intelligence.reputation.suspicious}`}
                                        size="small"
                                        sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning, fontWeight: 500 }}
                                      />
                                      <Chip
                                        label={`Harmless: ${result.ip_intelligence.reputation.harmless}`}
                                        size="small"
                                        sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success, fontWeight: 500 }}
                                      />
                                    </Stack>
                                  </Grid>
                                )}
                              </Grid>
                            </Paper>
                          )}
                        </motion.div>
                      )}

                      {/* AI Summary Tab - New */}
                      {activeTab === 3 && (
                        <motion.div
                          key="ai-summary"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Paper 
                            sx={{ 
                              p: 3, 
                              bgcolor: alpha(colors.primary, 0.02),
                              border: `1px solid ${alpha(colors.primary, 0.2)}`,
                              borderRadius: 2,
                              elevation: 0,
                            }}
                          >
                            {/* Header with AI icon */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(colors.primary, 0.1),
                                  color: colors.primary,
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                <PsychologyIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  AI SOC Summary
                                  <Chip
                                    icon={<AutoAwesomeIcon />}
                                    label="AI-Powered Analysis"
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(colors.primary, 0.1),
                                      color: colors.primary,
                                      ml: 1,
                                    }}
                                  />
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  Generated by LLaMA 3.1 • Real-time analysis
                                </Typography>
                              </Box>
                            </Box>

                            {result.soc_summary && !result.soc_summary.error ? (
                              <Grid container spacing={3}>
                                {/* Executive Summary */}
                                <Grid item xs={12}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2.5,
                                      bgcolor: alpha(colors.info, 0.03),
                                      border: `1px solid ${alpha(colors.info, 0.2)}`,
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                      <InfoIcon sx={{ color: colors.info, fontSize: 20 }} />
                                      <Typography variant="subtitle2" sx={{ color: colors.info, fontWeight: 600 }}>
                                        Executive Summary
                                      </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: colors.text, lineHeight: 1.6 }}>
                                      {result.soc_summary.executive_summary || "Potential security incident detected involving IP address from Germany, with a low risk score."}
                                    </Typography>
                                  </Paper>
                                </Grid>

                                {/* Business Impact */}
                                <Grid item xs={12}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2.5,
                                      bgcolor: alpha(colors.warning, 0.03),
                                      border: `1px solid ${alpha(colors.warning, 0.2)}`,
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                      <WarningIcon sx={{ color: colors.warning, fontSize: 20 }} />
                                      <Typography variant="subtitle2" sx={{ color: colors.warning, fontWeight: 600 }}>
                                        Business Impact
                                      </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: colors.text, lineHeight: 1.6 }}>
                                      {result.soc_summary.business_impact || "The business impact of this incident is currently low due to the low risk score and lack of malicious reputation associated with the IP address."}
                                    </Typography>
                                  </Paper>
                                </Grid>

                                {/* Recommended Actions */}
                                <Grid item xs={12}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2.5,
                                      bgcolor: alpha(colors.success, 0.03),
                                      border: `1px solid ${alpha(colors.success, 0.2)}`,
                                      borderRadius: 2,
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                      <CheckCircleIcon sx={{ color: colors.success, fontSize: 20 }} />
                                      <Typography variant="subtitle2" sx={{ color: colors.success, fontWeight: 600 }}>
                                        Recommended Actions
                                      </Typography>
                                    </Box>
                                    <Box component="ul" sx={{ m: 0, pl: 2, color: colors.text }}>
                                      {Array.isArray(result.soc_summary.recommended_actions) ? (
                                        result.soc_summary.recommended_actions.map((action, idx) => (
                                          <li key={idx}>
                                            <Typography variant="body1" sx={{ color: colors.text, lineHeight: 1.8 }}>
                                              {action}
                                            </Typography>
                                          </li>
                                        ))
                                      ) : (
                                        <li>
                                          <Typography variant="body1" sx={{ color: colors.text, lineHeight: 1.8 }}>
                                            {result.soc_summary.recommended_actions || "Monitor the IP for any further suspicious activity."}
                                          </Typography>
                                        </li>
                                      )}
                                    </Box>
                                  </Paper>
                                </Grid>

                                {/* Confidence Score */}
                                <Grid item xs={12}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                      AI Confidence:
                                    </Typography>
                                    <Rating 
                                      value={4.5} 
                                      precision={0.5} 
                                      readOnly 
                                      size="small"
                                      sx={{ color: colors.primary }}
                                    />
                                    <Chip
                                      label="High Confidence"
                                      size="small"
                                      sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <PsychologyIcon sx={{ fontSize: 48, color: alpha(colors.textSecondary, 0.5), mb: 2 }} />
                                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                                  No AI summary available for this log
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </motion.div>
                      )}

                      {/* Map Tab - Moved to Tab 4 (index 4) */}
                      {activeTab === 4 && (
                        <motion.div
                          key="map"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Paper sx={{ p: 2, bgcolor: colors.elevated, borderRadius: 2, elevation: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ color: colors.teal, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MapIcon />
                                Attack Origin Map
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  label="Standard"
                                  size="small"
                                  onClick={() => setMapView('standard')}
                                  sx={{
                                    bgcolor: mapView === 'standard' ? colors.primary : colors.surface,
                                    color: mapView === 'standard' ? 'white' : colors.textSecondary,
                                    border: `1px solid ${alpha(colors.textSecondary, 0.2)}`,
                                  }}
                                />
                                <Chip
                                  label="Satellite"
                                  size="small"
                                  onClick={() => setMapView('satellite')}
                                  sx={{
                                    bgcolor: mapView === 'satellite' ? colors.primary : colors.surface,
                                    color: mapView === 'satellite' ? 'white' : colors.textSecondary,
                                    border: `1px solid ${alpha(colors.textSecondary, 0.2)}`,
                                  }}
                                />
                              </Stack>
                            </Box>

                            <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(colors.textSecondary, 0.1)}` }}>
                              {result.ip_intelligence?.ip ? (
                                <MapContainer
                                  center={[getIpLocation(result.ip_intelligence.ip).lat, getIpLocation(result.ip_intelligence.ip).lng]}
                                  zoom={4}
                                  style={{ height: '100%', width: '100%' }}
                                >
                                  <TileLayer
                                    url={mapView === 'standard'
                                      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                                    }
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                  />
                                  <CircleMarker
                                    center={[getIpLocation(result.ip_intelligence.ip).lat, getIpLocation(result.ip_intelligence.ip).lng]}
                                    radius={15}
                                    fillColor={colors.error}
                                    color={colors.error}
                                    weight={2}
                                    opacity={0.8}
                                    fillOpacity={0.3}
                                  >
                                    <Popup>
                                      <Typography variant="body2" sx={{ color: '#000' }}>
                                        <strong>Source IP: {result.ip_intelligence.ip}</strong><br />
                                        {getIpLocation(result.ip_intelligence.ip).city}, {getIpLocation(result.ip_intelligence.ip).country}<br />
                                        Threat: {result.detection_result?.threat_detected || 'Unknown'}
                                      </Typography>
                                    </Popup>
                                  </CircleMarker>
                                  <Marker
                                    position={[getIpLocation(result.ip_intelligence.ip).lat, getIpLocation(result.ip_intelligence.ip).lng]}
                                  >
                                    <Popup>
                                      <Typography variant="body2" sx={{ color: '#000' }}>
                                        <strong>Attack Origin</strong><br />
                                        IP: {result.ip_intelligence.ip}<br />
                                        Location: {getIpLocation(result.ip_intelligence.ip).city}, {getIpLocation(result.ip_intelligence.ip).country}
                                      </Typography>
                                    </Popup>
                                  </Marker>
                                </MapContainer>
                              ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(colors.textSecondary, 0.05) }}>
                                  <Typography color={colors.textSecondary}>No location data available</Typography>
                                </Box>
                              )}
                            </Box>

                            {result.ip_intelligence?.geo && (
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Chip
                                  icon={<LocationIcon />}
                                  label={`${result.ip_intelligence.geo.city}, ${result.ip_intelligence.geo.country}`}
                                  sx={{ bgcolor: alpha(colors.teal, 0.1), color: colors.teal, fontWeight: 500 }}
                                />
                                <Chip
                                  icon={<ComputerIcon />}
                                  label={result.ip_intelligence.ip}
                                  sx={{ bgcolor: alpha(colors.teal, 0.1), color: colors.teal, fontWeight: 500 }}
                                />
                              </Box>
                            )}
                          </Paper>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LogAnalysis;