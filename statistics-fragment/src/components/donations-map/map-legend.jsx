import { useLeaflet } from "react-leaflet";
import { memo, useEffect } from "react";
import L from "leaflet";
import { getColor } from "./map-overlay";

/**
 * @return {null}
 */
function MapLegend() {
  const { map } = useLeaflet();
  const legend = L.control({ position: "bottomright" });

  useEffect(() => {
    const grades = [100, 90, 75, 50, 25];
    const labels = [];

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");

      let from;
      let to;

      for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          `<div class="legend-item-wrapper"><i style="background:${getColor(
            from
          )}"></i>` +
            `<span>${from + (to ? "&ndash;" + to : ">")}</span>` +
            `</div>`
        );
      }

      div.innerHTML = labels.join("<br>");
      return div;
    };

    legend.addTo(map);
  }, [map, legend]);

  return null;
}

export default memo(MapLegend);
