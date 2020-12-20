import React from "react";
import { Container, Fab, makeStyles } from "@material-ui/core";
import Introduction from "./introduction";
import Globe from "react-globe.gl";
import EarthNight from "../../assets/earth-night.jpg";
import EarthDay from "../../assets/earth-day.jpg";
import { useUiContext } from "../../hooks/use-ui-context";
import UpIcon from "@material-ui/icons/KeyboardArrowUp";
import { useMapStatistics } from "../../hooks/use-map-statistics";

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    position: "relative",
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

function MapOverlay3D() {
  const {
    state: { theme },
  } = useUiContext();
  const classes = useStyles();
  const { geoJsonFromSelectedStatistic } = useMapStatistics();

  return (
    <Container disableGutters classes={{ root: classes.containerRoot }}>
      <Introduction />
      {geoJsonFromSelectedStatistic.features && (
        <>
          <Globe
            globeImageUrl={theme === "dark" ? EarthNight : EarthDay}
            polygonsData={geoJsonFromSelectedStatistic.features}
          />
          <Fab
            aria-label="Scroll down"
            className={classes.fab}
            color="inherit"
            onClick={() =>
              window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth",
              })
            }
          >
            {<UpIcon />}
          </Fab>
        </>
      )}
    </Container>
  );
}

export { MapOverlay3D };