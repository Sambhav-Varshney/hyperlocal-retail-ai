import { useState } from "react";
import { HOME_IMAGES } from "../../assets/homeImages";

function HomeImage({ src, alt, className = "", lazy = false }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={failed ? HOME_IMAGES.storeFallback : src || HOME_IMAGES.storeFallback} alt={alt} loading={lazy ? "lazy" : undefined} onError={() => setFailed(true)} />;
}

export default HomeImage;
