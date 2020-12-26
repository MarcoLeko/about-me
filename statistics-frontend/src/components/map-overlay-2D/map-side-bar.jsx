import React, { memo, useState } from "react";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import {
  Divider,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import { useStatisticStepListener } from "../../hooks/use-statistic-step-listener";

const drawerWidth = "calc(100% - 48px)";

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(2),
    minWidth: 48,
    width: 48,
    height: 56,
    position: "relative",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: 4,
    zIndex: 9999,
  },
  mapSideBarContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    height: "100%",
  },
  paperAnchorLeft: { border: 0 },
  drawer: {
    flexShrink: 0,
    display: "flex",
    height: "inherit",
    whiteSpace: "nowrap",
    zIndex: 9999,
    background: theme.palette.background.default,
    width: drawerWidth,
    backgroundColor: theme.palette.background.paper,
  },
  drawerOpen: {
    position: "relative",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  sideBarContent: {
    margin: theme.spacing(2),
    width: "inherit",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  list: {
    backgroundColor: theme.palette.background.paper,
    width: "100%",
  },
  nestedListItem: {
    paddingLeft: theme.spacing(4),
  },
  listItem: {
    padding: `${theme.spacing(2)} 0`,
    whiteSpace: "normal",
  },
  listItemRoot: {
    minHeight: 56,
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: 0,
  },
}));

function MapSideBar({ mapStatistics, selectedStatistic }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { handleNext } = useStatisticStepListener();

  function toggleSidebar() {
    setOpen(!open);
  }

  function handleActiveStatisticItem(e, key) {
    handleNext(e, key);
  }

  return (
    <>
      <div className={classes.mapSideBarContainer}>
        <Drawer
          variant="permanent"
          elevation={0}
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
            paperAnchorLeft: classes.paperAnchorLeft,
          }}
        >
          <List
            className={classes.list}
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Select statistics powered by UNESCO
              </ListSubheader>
            }
          >
            {mapStatistics &&
              mapStatistics.map((statistic, index) => (
                <div key={statistic.key} className={classes.listItem}>
                  <Divider />
                  <ListItem
                    role={undefined}
                    dense
                    selected={
                      index ===
                      mapStatistics.findIndex(
                        (obj) => obj.key === selectedStatistic
                      )
                    }
                    button
                    classes={{ root: classes.listItemRoot }}
                    onClick={(e) => handleActiveStatisticItem(e, statistic.key)}
                  >
                    <ListItemText
                      id={statistic.key}
                      primary={statistic.description}
                    />
                  </ListItem>
                </div>
              ))}
          </List>
        </Drawer>
        <Button
          variant="contained"
          className={classes.button}
          disableFocusRipple
          onClick={toggleSidebar.bind(this)}
        >
          {open ? <ArrowBackIosRoundedIcon /> : <ArrowForwardIosRoundedIcon />}
        </Button>
      </div>
    </>
  );
}

export default memo(MapSideBar);
