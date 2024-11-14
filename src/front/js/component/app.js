// App.js

import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

const App = () => {
  const cld = new Cloudinary({ cloud: { cloudName: "drmbpbtgc" } });

  const img = cld
    .image("cld-sample-5")
    .format("auto")
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(500).height(500));

  return (
    <div>
      <h1>Cat Image from Cloudinary</h1>
      <AdvancedImage cldImg={img} />
    </div>
  );
};

export default App;
