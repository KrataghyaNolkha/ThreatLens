// src/components/Dashboard.js
import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  alpha,
  Container,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  Computer as ComputerIcon,
  BugReport as BugReportIcon,
  LocalPolice as LocalPoliceIcon,
  Biotech as BiotechIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
};

const Dashboard = () => {
  const { threats, stats, recentEvents, loading } = useRealtimeData();
  const [timeRange, setTimeRange] = useState('24h');

  const statCards = [
    {
      title: 'Active Threats',
      value: stats.activeThreats,
      icon: WarningIcon,
      color: colors.error,
      trend: '+12%',
      subtitle: 'vs yesterday',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents.toLocaleString(),
      icon: TimelineIcon,
      color: colors.info,
      trend: '+8%',
      subtitle: 'last 24h',
    },
    {
      title: 'MITRE Techniques',
      value: stats.mitreTechniques,
      icon: LocalPoliceIcon,
      color: colors.secondary,
      trend: '+3',
      subtitle: 'this week',
    },
    {
      title: 'Risk Score',
      value: stats.riskScore,
      icon: TrendingUpIcon,
      color: colors.warning,
      trend: stats.riskScore > 70 ? 'HIGH' : 'MEDIUM',
      subtitle: 'current',
    },
  ];

  const timelineData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
    datasets: [
      {
        label: 'Threat Level',
        data: [12, 19, 25, 42, 38, 30, 22],
        borderColor: colors.primary,
        backgroundColor: alpha(colors.primary, 0.1),
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const riskChartData = {
    datasets: [
      {
        data: [stats.riskScore, 100 - stats.riskScore],
        backgroundColor: [
          stats.riskScore > 70 ? colors.error : stats.riskScore > 40 ? colors.warning : colors.success,
          alpha(colors.textSecondary, 0.2),
        ],
        borderWidth: 0,
      },
    ],
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      case 'LOW': return colors.success;
      default: return colors.info;
    }
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              Security Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Real-time threat monitoring and analysis
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              icon={<CircleIcon sx={{ color: colors.success, fontSize: 12 }} />}
              label="System Online"
              sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success }}
            />
            <IconButton sx={{ bgcolor: alpha(colors.surface, 0.5) }}>
              <RefreshIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <LinearProgress sx={{ mb: 4 }} />
        ) : (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statCards.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        bgcolor: alpha(stat.color, 0.1),
                        border: `1px solid ${alpha(stat.color, 0.3)}`,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(stat.color, 0.2), color: stat.color }}>
                            <stat.icon />
                          </Avatar>
                          <Chip
                            label={stat.trend}
                            size="small"
                            sx={{
                              bgcolor: alpha(stat.color, 0.2),
                              color: stat.color,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(stat.color, 0.8), display: 'block', mt: 1 }}>
                          {stat.subtitle}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
              {/* Risk Chart */}
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: alpha(colors.surface, 0.5), border: `1px solid ${alpha(colors.primary, 0.2)}`, borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Risk Assessment</Typography>
                    <Box sx={{ position: 'relative', height: 200, display: 'flex', justifyContent: 'center' }}>
                      <Box sx={{ width: 200, height: 200 }}>
                        <Doughnut
                          data={riskChartData}
                          options={{
                            cutout: '70%',
                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                          }}
                        />
                      </Box>
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}>
                        <Typography variant="h2" sx={{ color: 'white', fontWeight: 700 }}>
                          {stats.riskScore}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Risk Score
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Timeline */}
              <Grid item xs={12} md={8}>
                <Card sx={{ bgcolor: alpha(colors.surface, 0.5), border: `1px solid ${alpha(colors.primary, 0.2)}`, borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white' }}>Threat Timeline</Typography>
                      <Stack direction="row" spacing={1}>
                        {['24h', '7d', '30d'].map((range) => (
                          <Button
                            key={range}
                            size="small"
                            variant={timeRange === range ? 'contained' : 'text'}
                            onClick={() => setTimeRange(range)}
                            sx={{
                              color: timeRange === range ? 'white' : colors.textSecondary,
                              bgcolor: timeRange === range ? colors.primary : 'transparent',
                            }}
                          >
                            {range}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                    <Box sx={{ height: 200 }}>
                      <Line
                        data={timelineData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { grid: { color: alpha(colors.textSecondary, 0.1) }, ticks: { color: colors.textSecondary } },
                            x: { ticks: { color: colors.textSecondary } },
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Threats */}
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: alpha(colors.surface, 0.5), border: `1px solid ${alpha(colors.error, 0.2)}`, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Recent Threats</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: colors.textSecondary }}>Threat Type</TableCell>
                            <TableCell sx={{ color: colors.textSecondary }}>Source IP</TableCell>
                            <TableCell sx={{ color: colors.textSecondary }}>Severity</TableCell>
                            <TableCell sx={{ color: colors.textSecondary }}>Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <AnimatePresence>
                            {threats.map((threat, index) => (
                              <motion.tr
                                key={threat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon sx={{ color: getSeverityColor(threat.severity), fontSize: 16 }} />
                                    <Typography variant="body2" sx={{ color: 'white' }}>{threat.type}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>{threat.ip}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={threat.severity}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(getSeverityColor(threat.severity), 0.2),
                                      color: getSeverityColor(threat.severity),
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>{threat.time}</Typography>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* IP Intelligence */}
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: alpha(colors.surface, 0.5), border: `1px solid ${alpha(colors.info, 0.2)}`, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Active IP Intelligence</Typography>
                    <Grid container spacing={2}>
                      {['203.55.77.99', '45.155.205.233', '8.8.8.8'].map((ip, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: alpha(colors.surface, 0.8), borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: alpha(colors.info, 0.2), color: colors.info, width: 32, height: 32 }}>
                                <PublicIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{ip}</Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Australia • Perth</Typography>
                              </Box>
                            </Box>
                            <Chip
                              label="Active"
                              size="small"
                              sx={{ bgcolor: alpha(colors.success, 0.2), color: colors.success }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Card sx={{ bgcolor: alpha(colors.primary, 0.1), border: `1px solid ${alpha(colors.primary, 0.3)}`, borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>Need deeper analysis?</Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Use our AI-powered SOC Assistant for detailed threat investigation
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        href="/soc-assistant"
                        sx={{
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                          color: 'white',
                          px: 4,
                        }}
                      >
                        Launch SOC Assistant →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;