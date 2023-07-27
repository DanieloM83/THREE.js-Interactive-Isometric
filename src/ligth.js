import * as THREE from 'three';


/** 
 * Creates a light controller function that can change the color or intensity of a collection 
 * of THREE.js light objects with simple <input> HTML tag.
 * 
 * @param {Array} light_objects - A list of THREE.js light objects (spotLight, pointLight, etc.)
 * @returns {Function} A function that takes an `event` from <input> tag and change Light parametres
 */
const lightController = (light_objects) => {
    const lightChanger = (event) => {

        var data = event.target.value   // get value from `input` widget

        if (data.startsWith("#")) {  // if `data` is hex
            light_objects.forEach(obj => obj.color = new THREE.Color(...hexToRgb(data)))  // change light color
        } else {  // if `data` is intensity (float)
            light_objects.forEach(obj => obj.intensity = data/100)  // change intensity (from 0.01 to 1)
        }
    }
    return lightChanger
};


/**
 * Creates an emission controller function that can change the emissive color or intensity of a
 * collection of THREE.js objects with a simple <input> HTML tag.
 * 
 * @param {Array} objects - A list of THREE.js meshes with Standard Material.
 * @returns {Function} A function that takes an `event` from the <input> tag and changes emissive parameters.
 */
const emissionController = (objects) => {
    const emissionChanger = (event) => {

        var data = event.target.value  // get value from `input` widget

        if (data.startsWith("#")) {  // if `data` is hex 
            objects.forEach(obj => obj.material.emissive = new THREE.Color(...hexToRgb(data)))  // change emissive color
        } else {  // if `data` is intensity (float)
            objects.forEach(obj => obj.material.emissiveIntensity = Number(data)/100)  // change intensity (from 0.01 to 1)
        }
    }
    return emissionChanger
};


/**
 * Converts a hexadecimal color representation to its corresponding RGB values (ranging from 0 to 1).
 *
 * @param {string} hexColor - The hexadecimal color string to convert (e.g., "#RRGGBB").
 * @returns {Array} An array containing the normalized RGB values [r, g, b].
 */
const hexToRgb = (hexColor) => {
    // Remove the '#' symbol (if present)
    hexColor = hexColor.replace('#', '');

    // Convert the hex color to normalized RGB values (ranging from 0 to 1)
    const r = parseInt(hexColor.substring(0, 2), 16) / 255;
    const g = parseInt(hexColor.substring(2, 4), 16) / 255;
    const b = parseInt(hexColor.substring(4, 6), 16) / 255;

    return [r, g, b]
};


export {lightController, emissionController, hexToRgb}