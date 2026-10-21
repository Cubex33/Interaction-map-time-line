# Semey Through the Ages — RU / KZ

An interactive historical map of Semey with Russian and Kazakh language interfaces.

## Getting Started

```bash
npm install
npm run dev
```

## Map Updates

- Historical event markers are passed to the map independently of the timeline filter; the timeline continues to filter the list of events.
- The `◎` button displays all marked locations and automatically adjusts the map zoom to fit them.
- The `➤` button requests browser permission to access the user's location and builds a driving route to the selected event using the OSRM routing service. An internet connection and location permission are required.
- Modern 3D buildings are hidden by default to prevent them from obscuring the reconstructed object. They can be enabled using the `▱ / ▥` button.
- The length of the schematic 3D model of the suspension bridge has been adjusted to approximately 750 m.
- Events related to the Semipalatinsk Test Site have been moved from the center of Semey to the approximate area of the test site.

## Important Notes on Historical Accuracy

The coordinates of some early historical events and events covering larger territories remain approximate when available sources do not confirm a specific location. The 3D construction stages are visual reconstructions, not archival models based on original measurements. Before publication, it is recommended to add a verified coordinate source for each object and indicate its level of accuracy.
