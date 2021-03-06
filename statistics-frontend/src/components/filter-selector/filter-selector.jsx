import { Grid, MenuItem, Paper, TextField } from "@material-ui/core";
import "./filter-selector.scss";
import React, { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { FilterSelectorSkeleton } from "../loaders/skeletons/filter-selector-skeleton/filter-selector-skeleton";

export function FilterSelector({
  filterStructure,
  queryParams,
  addNextQueryParam,
  fetchFilterStructure,
  amountOfCountries = 0,
}) {
  const [isSelectionTriggered, setIsSelectionTriggered] = useState(false);

  useEffect(() => {
    if (isSelectionTriggered && queryParams) {
      fetchFilterStructure();
      setIsSelectionTriggered(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  function handleChange(event, filterId) {
    setIsSelectionTriggered(true);
    addNextQueryParam({ [filterId]: event.target.value });
  }

  return (
    <>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        align={"center"}
        className="edu-header-h6"
      >
        {`Amount of effected countries: ${amountOfCountries}`}
      </Typography>
      <Grid container wrap={"wrap"} justify={"center"}>
        {filterStructure.dimensions?.observation?.length ? (
          filterStructure.dimensions.observation.map((filter) => (
            <Paper className="filter-select" elevation={1} key={filter.id}>
              <TextField
                select
                InputLabelProps={{ shrink: true }}
                label={filter.name}
                fullWidth
                color="primary"
                value={queryParams[filter.id] || ""}
                onChange={(e) => handleChange(e, filter.id)}
                variant="outlined"
              >
                {filter.values
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Paper>
          ))
        ) : (
          <FilterSelectorSkeleton />
        )}
      </Grid>
    </>
  );
}
