import "./CloudScene.scss";

const cloudLayers = ["back-cloud", "left-cloud", "right-cloud", "fore-cloud"];

function CloudScene() {
    return (
        <div className="cloud-scene" aria-hidden="true">
            {cloudLayers.map((layer) => (
                <span
                    className={`cloud-scene__layer cloud-scene__layer--${layer}`}
                    key={layer}
                />
            ))}
            <span className="cloud-scene__theme-wash" />
        </div>
    );
}

export default CloudScene;
