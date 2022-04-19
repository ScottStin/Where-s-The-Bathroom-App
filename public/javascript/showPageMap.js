mapboxgl.accessToken = mapToken //'<%-process.env.MAPBOX_TOKEN%>';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center:bathrooms.geometry.coordinates,
  zoom:9
});

new mapboxgl.Marker()
  .setLngLat(bathrooms.geometry.coordinates)
  .addTo(map)