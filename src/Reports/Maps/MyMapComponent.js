import React, { Component } from 'react';
import { compose, withProps, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from "react-google-maps";
import { MarkerClusterer } from "react-google-maps/lib/components/addons/MarkerClusterer";


const MyMapComponent = compose(
    withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyCPbyemMRyuWmR7yiD-nIwXaaeZaw-jK9o&v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `100%` }} />,
        mapElement: <div style={{ height: `100%` }} />
    }),
    withScriptjs,
    withGoogleMap,
) (props => (<GoogleMap defaultZoom={8} zoom={props.zoom}
    ref={props.refName}
    defaultCenter={{ lat: 17.427500, lng: 78.414125 }}
    center={{ lat: props.centerLat, lng: props.centerLng }}>
    {
        props.mode === "All" ?
            <MarkerClusterer averageCenter enableRetinaIcons gridSize={60}>
                {
                    props.dataForDay.map((location, i) => {
                        return <Marker
                            key={location.Latitude + location.EmployeeId}
                            position={{ lat: parseFloat(location.Latitude), lng: parseFloat(location.Longitude) }}
                            icon={props.hoveredEmployee === location.EmployeeId ? null : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
                            onMouseOut={() => props.onLocationMouseLeave()}
                            onMouseOver={() => props.onLocationMouseEnter(location.EmployeeId)}
                        />
                    })
                }
            </MarkerClusterer>
            :
            <div>
                {
                    props.hoveredLocation ?
                        <Marker
                            key={props.hoveredLocation.Latitude + props.hoveredLocation.Longitude}
                            position={props.hoveredLocation}
                        />
                        :
                        null
                }

                <Polyline
                    path={props.pathCoordinates}
                    geodesic={true}
                    options={{
                        strokeColor: "#000",
                        strokeOpacity: 0.75,
                        strokeWeight: 5
                    }}
                />
            </div>

    }



</GoogleMap >

));

export { MyMapComponent }