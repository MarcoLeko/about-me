"use strict";

const chalk = require("chalk");
const {
  fetchGeoCountriesPolygons,
  fetchUnescoStatisticWithUrl,
  writeToFileSync,
  fetchUnescoHierarchicalCodeList,
  ensureDirectory,
  matchUnescoRegionsWithGeoJson,
  matchUnescoCountriesWithGeoJson,
  createMapStatisticsOutputPath,
  createMapStatisticsTempPath,
  fetchEnhancedCountryInformation,
} = require("./map-statistics-generator.service");
const mapStatistics = require("./map-statistics");
const topojson = require("topojson-server");
const topojsonSimplify = require("topojson-simplify");
const log = console.log;

(async function () {
  try {
    const enhancedCountriesMetaData = [];
    ensureDirectory(createMapStatisticsTempPath(""));

    const unescoHierarchicalCodeListJson = await fetchUnescoHierarchicalCodeList();
    writeToFileSync(
      unescoHierarchicalCodeListJson,
      createMapStatisticsTempPath("unesco-hierarchical-code-list.json")
    );

    const countriesGeoJsonResponse = await fetchGeoCountriesPolygons();
    const preSimplyfiedTopojson = topojsonSimplify.presimplify(
      topojson.topology({
        countries: countriesGeoJsonResponse,
      })
    );

    const countriesGeoJsonCompressed = topojsonSimplify.simplify(
      preSimplyfiedTopojson,
      0.01
    );

    writeToFileSync(
      countriesGeoJsonCompressed,
      createMapStatisticsTempPath("countries.json")
    );

    for (const [index, statistic] of mapStatistics.entries()) {
      const unescoRegions = new Map(),
        resultArrayWithCountryMatches = [];

      const unescoStatisticsJson = await fetchUnescoStatisticWithUrl(
        Object.values(mapStatistics)[index].url
      );

      writeToFileSync(
        unescoStatisticsJson,
        createMapStatisticsTempPath(`${statistic.key}.json`)
      );

      const availableCountriesStatistics = unescoStatisticsJson.structure.dimensions.series.find(
        (data) => data.id === "REF_AREA"
      );

      if (
        availableCountriesStatistics.values.length !==
        Object.keys(unescoStatisticsJson.dataSets[0].series).length
      ) {
        throw new Error(
          "There are more Observations than REF_AREA countries - multi dimension observations are currently not supported"
        );
      }

      matchUnescoCountriesWithGeoJson(
        countriesGeoJsonCompressed,
        availableCountriesStatistics,
        unescoStatisticsJson,
        resultArrayWithCountryMatches,
        unescoRegions
      );

      log(
        `Total hits of matching countries: ${chalk.bold.green(
          resultArrayWithCountryMatches.filter(
            (item) => item.properties.value !== null
          ).length
        )}`
      );

      log(
        `Total hits of not matching countries/areas: ${chalk.bold.red(
          unescoRegions.size
        )}`
      );

      matchUnescoRegionsWithGeoJson(
        unescoHierarchicalCodeListJson,
        availableCountriesStatistics,
        unescoStatisticsJson,
        countriesGeoJsonCompressed,
        resultArrayWithCountryMatches,
        unescoRegions
      );

      for await (const country of resultArrayWithCountryMatches) {
        let enhancedCountryData = enhancedCountriesMetaData.find(
          (enhancedCountry) => {
            return (
              enhancedCountry &&
              enhancedCountry.alpha2Code &&
              country.properties.id.toLowerCase() ===
                enhancedCountry.alpha2Code.toLowerCase()
            );
          }
        );

        if (!enhancedCountryData) {
          [enhancedCountryData] = await fetchEnhancedCountryInformation(
            country.properties.id
          );

          enhancedCountriesMetaData.push(enhancedCountryData);
        }

        const { latlng, capital } = enhancedCountryData;

        country.properties = {
          ...country.properties,
          latitude: latlng[0],
          longitude: latlng[1],
          capital,
        };
      }

      const output = {
        key: statistic.key,
        description: statistic.description,
        startYear: statistic.startYear,
        endYear: statistic.endYear,
        evaluationType: statistic.evaluationType,
        type: countriesGeoJsonCompressed.type,
        arcs: countriesGeoJsonCompressed.arcs,
        amountOfCountries: resultArrayWithCountryMatches.filter(
          (item) => item.properties.value !== null
        ).length,
        objects: {
          countries: {
            bbox: countriesGeoJsonCompressed.bbox,
            type: countriesGeoJsonCompressed.objects.countries.type,
            geometries: resultArrayWithCountryMatches,
          },
        },
      };

      ensureDirectory(createMapStatisticsOutputPath(""));
      writeToFileSync(
        output,
        createMapStatisticsOutputPath(`${statistic.key}.json`)
      );

      log(
        chalk.bold(
          `Output file generated at: ${chalk.green.underline(
            createMapStatisticsOutputPath(`${statistic.key}.json`)
          )} with: ${chalk.green.underline(
            resultArrayWithCountryMatches.length
          )} countries`
        )
      );
    }
  } catch (e) {
    log(chalk.bold.red("Oooops! An error occured " + e));
    process.exit(1);
  }
})();
