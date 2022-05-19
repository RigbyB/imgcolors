// https://stackoverflow.com/a/39077686
export const rgbToHex = (r: number, g: number, b: number, a: number) => {
    // TODO: Speed this up
    return "#" + [r, g, b, a].map(value => {
        const hex = Math.floor(Math.min(value, 255)).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

const beginSampler = (image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");
    if (context) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return {
            context,
            image
        };
    }

    return null;
}

export const beginSamplerFromImage = (image: HTMLImageElement) => {
    return new Promise<{ context: CanvasRenderingContext2D, image: HTMLImageElement }>((resolve, reject) => {
        // TODO: Clean
        if (image.complete) {
            const val = beginSampler(image);
            if (val) resolve(val);
            else reject("Failed to begin sampler.");
        } else {
            image.onload = () => {
                const val = beginSampler(image);
                if (val) resolve(val);
                else reject("Failed to begin sampler.");
            };
        }
    });
}

export const beginSamplerFromURL = (url: string) => {
    const image = new Image();
    // Allow loading from other sites.
    image.setAttribute("crossOrigin", "");
    image.src = url;
    return beginSamplerFromImage(image);
}


export const getAllPixels = (image: HTMLImageElement, context: CanvasRenderingContext2D) => {
    return context.getImageData(0, 0, image.width, image.height).data;
}

export const getDominantColor = (image: HTMLImageElement, context: CanvasRenderingContext2D) => {
    const pixels = getAllPixels(image, context);
    const colors: { [color: string]: number } = {};
    for (let i = 0; i < pixels.length; i += 4) {
        // i + (r, g, b, a)
        const hex = rgbToHex(
            pixels[i],
            pixels[i + 1],
            pixels[i + 2],
            pixels[i + 3]
        );
        colors[hex] ? colors[hex] += 1 : colors[hex] = 1;
    }
    // Return highest key
    return Object.keys(colors).reduce((a, b) => colors[a] > colors[b] ? a : b);
}

export const getAverageColor = (image: HTMLImageElement, context: CanvasRenderingContext2D) => {
    const pixels = getAllPixels(image, context);
    let colors: number[] = [0, 0, 0, 0];

    for (let i = 0; i < pixels.length; i += 4) {
        // i + (r, g, b, a)
        colors[0] += pixels[i];
        colors[1] += pixels[i + 1];
        colors[2] += pixels[i + 2];
        colors[3] += pixels[i + 3];
    }
    colors = colors.map((value) => {
        return value / 255;
    })
    return rgbToHex(colors[0], colors[1], colors[2], colors[3]);
}
