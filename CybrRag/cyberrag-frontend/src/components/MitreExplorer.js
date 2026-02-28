// src/components/MitreExplorer.js
import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Box,
  alpha,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fade,
  Zoom,
  Badge,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  LocalPolice as LocalPoliceIcon,
  BugReport as BugReportIcon,
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  MenuBook as MenuBookIcon,
  ArrowForward as ArrowForwardIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { getMitreTechnique } from '../services/api';

const colors = {
  primary: '#4f46e5', // Slightly deeper indigo for light mode contrast
  secondary: '#7c3aed',
  accent: '#db2777',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  purple: '#7c3aed',
  background: '#f8fafc', // Light slate background
  surface: '#ffffff',    // White cards
  text: '#1e293b',       // Dark slate text
  textSecondary: '#64748b', // Muted slate text
};

const MitreExplorer = () => {
  const [techniqueId, setTechniqueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedTechniques, setSavedTechniques] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const commonTechniques = [
    { id: 'T1110', name: 'Brute Force', description: 'Attempt to gain access by trying multiple passwords', color: colors.error },
    { id: 'T1059', name: 'Command and Scripting Interpreter', description: 'Execute commands through scripting interfaces', color: colors.purple },
    { id: 'T1003', name: 'OS Credential Dumping', description: 'Extract credentials from operating systems', color: colors.warning },
    { id: 'T1566', name: 'Phishing', description: 'Social engineering to obtain credentials', color: colors.info },
    { id: 'T1486', name: 'Data Encrypted for Impact', description: 'Ransomware and data encryption attacks', color: colors.accent },
  ];

  const handleSearch = async () => {
    if (!techniqueId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getMitreTechnique(techniqueId);
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
        setRecentSearches(prev => [techniqueId, ...prev.filter(t => t !== techniqueId)].slice(0, 5));
      }
    } catch (err) {
      setError('Failed to fetch MITRE technique. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTechniqueId('');
    setResult(null);
    setError(null);
  };

  const toggleSave = (technique) => {
    if (savedTechniques.find(t => t.id === technique.id)) {
      setSavedTechniques(prev => prev.filter(t => t.id !== technique.id));
    } else {
      setSavedTechniques(prev => [technique, ...prev].slice(0, 10));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(colors.purple, 0.1)} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(colors.purple, 0.1)}`,
          borderRadius: 0,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg, ${colors.purple}, ${colors.primary})`,
              }}
            >
              <MenuBookIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700, mb: 1 }}>
              MITRE ATT&CK Explorer
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Explore and analyze adversary tactics and techniques
            </Typography>
          </Grid>
          <Grid item>
            <Badge badgeContent={savedTechniques.length} color="primary">
              <IconButton sx={{ bgcolor: colors.surface, border: `1px solid ${alpha(colors.textSecondary, 0.2)}` }}>
                <BookmarkIcon sx={{ color: colors.textSecondary }} />
              </IconButton>
            </Badge>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ px: 3 }}>
        {/* Left Panel - Search & Common Techniques */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                bgcolor: colors.surface,
                border: `1px solid ${alpha(colors.purple, 0.2)}`,
                borderRadius: 3,
                mb: 3,
                boxShadow: `0 4px 6px -1px ${alpha(colors.text, 0.05)}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: colors.text, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon sx={{ color: colors.purple }} />
                  Search Technique
                </Typography>

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter MITRE ID (e.g., T1110)"
                  value={techniqueId}
                  onChange={(e) => setTechniqueId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPoliceIcon sx={{ color: colors.purple }} />
                      </InputAdornment>
                    ),
                    endAdornment: techniqueId && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClear}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha(colors.background, 0.5),
                      // This ensures the typed text and placeholder are dark/black
                      color: '#000000',
                      '& fieldset': {
                        borderColor: alpha(colors.purple, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: colors.purple,
                      },
                      // Ensures the text remains black when focused
                      '&.Mui-focused fieldset': {
                        borderColor: colors.purple,
                      },
                    },
                    // This targets the input text specifically
                    '& .MuiInputBase-input': {
                      color: '#000000',
                    },
                    // Optional: Adjust placeholder color if it's too light
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha('#000000', 0.6),
                      opacity: 1,
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !techniqueId.trim()}
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.purple}, ${colors.primary})`,
                    boxShadow: `0 4px 14px 0 ${alpha(colors.primary, 0.39)}`,
                    py: 1.5,
                  }}
                >
                  Search
                </Button>

                {loading && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Fetching technique details...
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Fade in>
                    <Alert severity="error" sx={{ mt: 2, bgcolor: alpha(colors.error, 0.1), color: colors.error }}>
                      {error}
                    </Alert>
                  </Fade>
                )}
              </CardContent>
            </Card>

            <Card
              sx={{
                bgcolor: colors.surface,
                border: `1px solid ${alpha(colors.purple, 0.2)}`,
                borderRadius: 3,
                boxShadow: `0 4px 6px -1px ${alpha(colors.text, 0.05)}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon sx={{ color: colors.purple }} />
                  Common Techniques
                </Typography>

                <List sx={{ width: '100%' }}>
                  {commonTechniques.map((technique, index) => (
                    <Zoom in key={technique.id} style={{ transitionDelay: `${index * 50}ms` }}>
                      <ListItem
                        button
                        onClick={() => {
                          setTechniqueId(technique.id);
                          setTimeout(() => handleSearch(), 100);
                        }}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: alpha(technique.color, 0.05),
                          border: `1px solid ${alpha(technique.color, 0.1)}`,
                          '&:hover': {
                            bgcolor: alpha(technique.color, 0.1),
                          },
                        }}
                      >
                        <ListItemIcon>
                          <LocalPoliceIcon sx={{ color: technique.color }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                              {technique.id} - {technique.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {technique.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Zoom>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Panel - Results */}
        <Grid item xs={12} md={8}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    bgcolor: colors.surface,
                    border: `1px solid ${alpha(colors.success, 0.3)}`,
                    borderRadius: 3,
                    boxShadow: `0 10px 15px -3px ${alpha(colors.text, 0.1)}`,
                  }}
                >
                  <CardContent>
                    {/* Result Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(colors.purple, 0.1), color: colors.purple }}>
                          <LocalPoliceIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700 }}>
                            {result.id}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ color: colors.purple }}>
                            {result.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Save Technique">
                          <IconButton onClick={() => toggleSave(result)} sx={{ color: colors.textSecondary }}>
                            {savedTechniques.find(t => t.id === result.id) ? (
                              <BookmarkIcon sx={{ color: colors.purple }} />
                            ) : (
                              <BookmarkBorderIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy ID">
                          <IconButton onClick={() => copyToClipboard(result.id)} sx={{ color: colors.textSecondary }}>
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton sx={{ color: colors.textSecondary }}>
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Divider sx={{ borderColor: alpha(colors.purple, 0.1), mb: 3 }} />

                    {/* Description */}
                    <Typography variant="subtitle2" sx={{ color: colors.purple, mb: 2 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.text, mb: 4, lineHeight: 1.8 }}>
                      {result.description}
                    </Typography>

                    {/* Additional Info */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(colors.info, 0.05), border: `1px solid ${alpha(colors.info, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                          <Typography variant="subtitle2" sx={{ color: colors.info, mb: 1 }}>
                            Tactics
                          </Typography>
                          <Chip
                            label="Execution"
                            size="small"
                            sx={{ bgcolor: alpha(colors.info, 0.1), color: colors.info, mr: 1, fontWeight: 500 }}
                          />
                          <Chip
                            label="Persistence"
                            size="small"
                            sx={{ bgcolor: alpha(colors.info, 0.1), color: colors.info, fontWeight: 500 }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: alpha(colors.warning, 0.05), border: `1px solid ${alpha(colors.warning, 0.2)}`, borderRadius: 2, elevation: 0 }}>
                          <Typography variant="subtitle2" sx={{ color: colors.warning, mb: 1 }}>
                            Platforms
                          </Typography>
                          <Chip
                            label="Windows"
                            size="small"
                            sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning, mr: 1, fontWeight: 500 }}
                          />
                          <Chip
                            label="Linux"
                            size="small"
                            sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning, mr: 1, fontWeight: 500 }}
                          />
                          <Chip
                            label="macOS"
                            size="small"
                            sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning, fontWeight: 500 }}
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card
                  sx={{
                    bgcolor: colors.surface,
                    border: `1px solid ${alpha(colors.purple, 0.1)}`,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    boxShadow: `0 4px 6px -1px ${alpha(colors.text, 0.05)}`,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocalPoliceIcon sx={{ fontSize: 80, color: alpha(colors.purple, 0.2), mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
                      No Technique Selected
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(colors.textSecondary, 0.7) }}>
                      Enter a MITRE ID or select from common techniques
                    </Typography>
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

export default MitreExplorer;