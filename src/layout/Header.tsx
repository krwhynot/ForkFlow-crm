import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {
    AppBar,
    Box,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    CanAccess,
    LoadingIndicator,
    Logout,
    UserMenu,
    useUserMenu,
} from 'react-admin';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { useUserRole } from '../components/auth/RoleBasedComponent';
import { SecurityStatusBar } from '../components/security/SecurityStatusBar';

const Header = () => {
    const { logo, title } = useConfigurationContext();
    const location = useLocation();

    let currentPath: string | boolean = '/';
    if (!!matchPath('/', location.pathname)) {
        currentPath = '/';
    } else if (!!matchPath('/contacts/*', location.pathname)) {
        currentPath = '/contacts';
    } else if (!!matchPath('/companies/*', location.pathname)) {
        currentPath = '/companies';
    } else if (!!matchPath('/interactions/*', location.pathname)) {
        currentPath = '/interactions';
    } else if (!!matchPath('/opportunities/*', location.pathname)) {
        currentPath = '/opportunities';
    } else if (!!matchPath('/products/*', location.pathname)) {
        currentPath = '/products';
    } else {
        currentPath = false;
    }

    return (
        <Box component="nav" sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary">
                <Toolbar variant="dense">
                    <Box flex={1} display="flex" justifyContent="space-between">
                        <Box
                            display="flex"
                            alignItems="center"
                            component={Link}
                            to="/"
                            sx={{
                                color: 'inherit',
                                textDecoration: 'inherit',
                            }}
                            gap={1.5}
                        >
                            <Box
                                component="img"
                                sx={{ height: 24 }}
                                src={logo}
                                alt={title}
                            />
                            <Typography component="span" variant="h5">
                                {title}
                            </Typography>
                        </Box>
                        <Box>
                            <Tabs
                                value={currentPath}
                                aria-label="Navigation Tabs"
                                indicatorColor="secondary"
                                textColor="inherit"
                            >
                                <Tab
                                    label={'Dashboard'}
                                    component={Link}
                                    to="/"
                                    value="/"
                                />
                                <Tab
                                    label={'Contacts'}
                                    component={Link}
                                    to="/contacts"
                                    value="/contacts"
                                />
                                <Tab
                                    label={'Organizations'}
                                    component={Link}
                                    to="/companies"
                                    value="/companies"
                                />
                                <Tab
                                    label={'Interactions'}
                                    component={Link}
                                    to="/interactions"
                                    value="/interactions"
                                />
                                <Tab
                                    label={'Opportunities'}
                                    component={Link}
                                    to="/opportunities"
                                    value="/opportunities"
                                />
                                <Tab
                                    label={'Products'}
                                    component={Link}
                                    to="/products"
                                    value="/products"
                                />
                            </Tabs>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <SecurityStatusBar compact />
                            <LoadingIndicator />
                            <UserMenu>
                                <ProfileMenu />
                                <CanAccess resource="analytics" action="list">
                                    <AnalyticsMenu />
                                </CanAccess>
                                <ConfigurationMenu />
                                <CanAccess resource="users" action="list">
                                    <UsersMenu />
                                </CanAccess>
                                <Logout />
                            </UserMenu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

const ProfileMenu = () => {
    const { onClose } = useUserMenu() ?? {};
    return (
        <MenuItem component={Link} to="/profile" onClick={onClose}>
            <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
        </MenuItem>
    );
};

const AnalyticsMenu = () => {
    const { onClose } = useUserMenu() ?? {};
    return (
        <MenuItem component={Link} to="/analytics" onClick={onClose}>
            <ListItemIcon>
                <AnalyticsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Analytics</ListItemText>
        </MenuItem>
    );
};

const UsersMenu = () => {
    const { onClose } = useUserMenu() ?? {};
    return (
        <MenuItem component={Link} to="/sales" onClick={onClose}>
            <ListItemIcon>
                <PeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Users</ListItemText>
        </MenuItem>
    );
};

const ConfigurationMenu = () => {
    const { onClose } = useUserMenu() ?? {};
    return (
        <MenuItem component={Link} to="/settings" onClick={onClose}>
            <ListItemIcon>
                <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>My info</ListItemText>
        </MenuItem>
    );
};
export default Header;
