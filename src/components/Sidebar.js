import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/system';

// Icons
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const iconSize = '22px';

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'isCollapsed',
})(({ isCollapsed }) => ({
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        boxSizing: 'border-box',
        backgroundColor: 'var(--sidebar-color)',
        transition: 'width 0.3s ease', // Smooth width transition
    },
}));

const StyledList = styled(List)({
    paddingTop: 0
});

const StyledListItemButton = styled(ListItemButton)({
    borderRadius: '10px',
    margin: '8px 10px', // Reduced margin for better visual appearance
    padding: '0px 15px',
    color: 'var(--sidebar-text-color)',
    '&:hover': {
        backgroundColor: 'var(--sidebar-item-hover-color)', // Slightly darker on hover
    },
    // Adjust the '&.Mui-selected' selector for when the button is selected
    '&.Mui-selected': {
        backgroundColor: 'var(--sidebar-item-selected-color)',
        color: 'var(--sidebar-text-selected-color)',
        '&:hover': {
            backgroundColor: 'var(--sidebar-item-hover-color)', // Slightly darker on hover for selected item
        },
    },
});

const StyledIcon = styled('div')(({ theme, isCollapsed }) => ({
    display: 'flex',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    marginRight: isCollapsed ? '0px' : '5px',
    width: isCollapsed ? '100%' : 'auto', // Ensures the div takes up the full width of its parent
}));

function Sidebar({ sections, activeSection, setActiveSection, isCollapsed, toggleSidebar }) {
    return (
        <StyledDrawer variant="permanent" anchor="left" isCollapsed={isCollapsed}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    paddingBottom: '0px',
                    justifyContent: 'space-between', // This ensures items are spread out
                }}
            >
                {/* This spacer Box will push the Chevron to the right when not collapsed */}
                {!isCollapsed && <Box flex={1} />}
                <IconButton onClick={toggleSidebar} sx={{ alignSelf: 'center' }}>
                    {isCollapsed ? <ChevronRightIcon sx={{ fontSize: iconSize, color: 'white' }} /> : <ChevronLeftIcon sx={{ fontSize: iconSize, color: 'white' }} />}
                </IconButton>
                {/* This spacer is only visible (takes space) when sidebar is not collapsed, balancing the layout */}
                {isCollapsed && <Box flex={1} />}
            </Box>
            <Box sx={{
                padding: '0px 0 0 10px',
                textAlign: "start",
            }}>
                <Typography variant="body1" color="grey" fontSize={'12px'}
                    sx={{
                        visibility: isCollapsed ? 'hidden' : 'visible',
                        marginBottom: 0,
                    }}
                    gutterBottom>
                    Explore
                </Typography>
            </Box>
            <StyledList>
                {sections.map((section, index) => (
                    <StyledListItemButton
                        key={index}
                        selected={index === activeSection}
                        onClick={() => setActiveSection(index)} >
                        <StyledIcon isCollapsed={isCollapsed}>
                            <section.Icon sx={{ fontSize: iconSize }} />
                        </StyledIcon>
                        {!isCollapsed && (
                            <ListItemText primary={section.label}
                                primaryTypographyProps={{
                                    style: {
                                        fontWeight: index === activeSection ? 'bold' : 'normal',
                                        fontSize: '14px',
                                    }
                                }}
                            />
                        )}
                    </StyledListItemButton>
                ))}
            </StyledList>
        </StyledDrawer>
    );
}

export default Sidebar;
