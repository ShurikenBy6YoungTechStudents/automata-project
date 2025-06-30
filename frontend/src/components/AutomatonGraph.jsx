import React, { useEffect, useState } from "react";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";

export default function AutomatonGraph({ dotSource }) {
    const [svg, setSvg] = useState("");

    useEffect(() => {
        if (!dotSource) return;

        const viz = new Viz({ Module, render });
        viz.renderString(dotSource)
            .then(result => setSvg(result))
            .catch(error => {
                console.error("Viz error:", error);
            });
    }, [dotSource]);

    return (
        <div
            className="w-full overflow-auto mt-4 border p-4 rounded bg-white"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
