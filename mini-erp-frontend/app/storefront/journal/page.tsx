"use client";

import React from "react";
import Link from "next/link";

export default function JournalPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-5 md:px-16 py-12">
      {/* Header Section */}
      <header className="mb-12 flex flex-col items-center text-center">
        <h1 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg text-sf-primary mb-6">The Journal</h1>
        
        {/* Search & Filters */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sf-on-surface-variant">search</span>
            <input 
              className="w-full bg-sf-surface-container-lowest border-0 border-b-2 border-sf-surface-variant focus:border-sf-primary focus:ring-0 pl-12 pr-4 py-3 font-sf-body text-sf-body-md transition-colors placeholder:text-sf-on-surface-variant/60 outline-none" 
              placeholder="Search articles..." 
              type="text"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-sf-primary text-sf-on-primary font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-primary/90 transition-colors">All</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Recipes</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Sustainability</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Growers</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Health</button>
          </div>
        </div>
      </header>

      {/* Article List */}
      <div className="flex flex-col gap-12">
        {/* Article 1 */}
        <article className="group flex flex-col md:flex-row gap-8 items-center bg-sf-surface-container-lowest border border-sf-surface-variant/50 hover:shadow-[0_10px_40px_-15px_rgba(21,66,18,0.1)] transition-all duration-300 rounded-xl overflow-hidden cursor-pointer">
          <div className="w-full md:w-2/5 aspect-square md:aspect-[4/5] overflow-hidden bg-sf-surface-container-low">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
              alt="Article 1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiphz7kMlrx-HZLL4ByS_Bch0EjBfysPm5ZoG03jxRZe3z5mshipBNX03xuginZ6J1hrj_TcYgrBHEYBvy9ozHTZPFeUmXjzJJ6py1WiZNaPOO6uSsJZjvNW01xJojtRlRIa7YNnOhibNBvk42TGLEXy98oFO7L3Q4_jAS0akNaI4T4pyWMxtiTYBsqIwLFAvRkjsEa4cKk_d2H1yJsVriCHDXjEjFPYEZBoVJb1YB0Yrq4-2Sfs2j"
            />
          </div>
          <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider">Growers</span>
              <span className="w-1 h-1 bg-sf-surface-variant rounded-full"></span>
              <time className="font-sf-body text-sf-label-caps text-sf-on-surface-variant">October 12, 2023</time>
            </div>
            <h2 className="font-sf-display text-sf-headline-md text-sf-on-background mb-4 group-hover:text-sf-primary transition-colors">
              The Art of Soil: Meet the Farmers Regenerating Our Land
            </h2>
            <p className="font-sf-body text-sf-body-lg text-sf-on-surface-variant mb-8 line-clamp-3">
              Discover the profound impact of regenerative agriculture through the stories of local farmers who are dedicating their lives to nurturing the soil, resulting in produce that is not only more nutritious but deeply connected to the earth's natural rhythms.
            </p>
            <Link className="inline-flex items-center gap-2 font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider hover:gap-4 transition-all w-fit" href="/storefront/journal/1">
              Read Story
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </article>

        {/* Article 2 */}
        <article className="group flex flex-col md:flex-row gap-8 items-center bg-sf-surface-container-lowest border border-sf-surface-variant/50 hover:shadow-[0_10px_40px_-15px_rgba(21,66,18,0.1)] transition-all duration-300 rounded-xl overflow-hidden cursor-pointer">
          <div className="w-full md:w-2/5 aspect-square md:aspect-[4/5] overflow-hidden bg-sf-surface-container-low md:order-last">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
              alt="Article 2"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4P4dhdUCvawESHxa7ebsy2jL1A67ANY4CZAvP_xzfAbjy-ndLf_Iyd3IzUgPV6jGfmUSqHrca4uetm2JXErTbm2CwhJDwCA0humx1ymqXgdumNUxDfuWIBCST5bq6VOhGgZG9-gsZPQf62Tb81ICTf4_C0YtgaVAEus8b248l0WbLjw3gCCOscfZ1twlsTNtwBlP9ddOHiqBqg-7caVB517Qeohy0ufRxwetUnHAt7Vnm-DLq19y-"
            />
          </div>
          <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider">Recipes</span>
              <span className="w-1 h-1 bg-sf-surface-variant rounded-full"></span>
              <time className="font-sf-body text-sf-label-caps text-sf-on-surface-variant">October 05, 2023</time>
            </div>
            <h2 className="font-sf-display text-sf-headline-md text-sf-on-background mb-4 group-hover:text-sf-primary transition-colors">
              Slow Mornings: The Perfect Olive Oil & Rosemary Sourdough
            </h2>
            <p className="font-sf-body text-sf-body-lg text-sf-on-surface-variant mb-8 line-clamp-3">
              Embrace the slowness of weekend mornings with this deeply satisfying sourdough recipe. We explore the essential techniques for achieving the perfect crust and an airy, aromatic crumb using our single-estate olive oil.
            </p>
            <Link className="inline-flex items-center gap-2 font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider hover:gap-4 transition-all w-fit" href="/storefront/journal/2">
              Read Story
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </article>

        {/* Article 3 */}
        <article className="group flex flex-col md:flex-row gap-8 items-center bg-sf-surface-container-lowest border border-sf-surface-variant/50 hover:shadow-[0_10px_40px_-15px_rgba(21,66,18,0.1)] transition-all duration-300 rounded-xl overflow-hidden cursor-pointer">
          <div className="w-full md:w-2/5 aspect-square md:aspect-[4/5] overflow-hidden bg-sf-surface-container-low">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
              alt="Article 3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg4_NB8rfxWsO77VDlJGiP1LWpKukVcx2Z30bZK3VGIBJsCYmoBR9sLtbRPuC0RP545DXUuYFrzylFVko81CUU9WjSIUPjtZ1fyTuIr2-3mmsB0K95WsQNvX6HtILf5HOdJTdB3R5Z8XD9fq8zrAEwkW_C2n2OelizPVZnZff3ZuPDa_gg6DzUTB8fd39U2HpBuw4UCaenDQPzjeCZfBKdrGEWqqh2qyku76BZbAHWFdym2QWTsOEO"
            />
          </div>
          <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider">Sustainability</span>
              <span className="w-1 h-1 bg-sf-surface-variant rounded-full"></span>
              <time className="font-sf-body text-sf-label-caps text-sf-on-surface-variant">September 28, 2023</time>
            </div>
            <h2 className="font-sf-display text-sf-headline-md text-sf-on-background mb-4 group-hover:text-sf-primary transition-colors">
              Minimizing Waste: A Practical Guide to the Zero-Waste Pantry
            </h2>
            <p className="font-sf-body text-sf-body-lg text-sf-on-surface-variant mb-8 line-clamp-3">
              Transitioning to a zero-waste lifestyle doesn't happen overnight. It's a journey of small, intentional choices. Learn how to curate a beautiful, functional pantry that eliminates single-use plastics and celebrates bulk buying.
            </p>
            <Link className="inline-flex items-center gap-2 font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider hover:gap-4 transition-all w-fit" href="/storefront/journal/3">
              Read Story
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </article>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <button className="px-8 py-3 border border-sf-primary text-sf-primary font-sf-body text-sf-label-caps uppercase tracking-wider hover:bg-sf-primary hover:text-sf-on-primary transition-colors duration-300 rounded-full">
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  );
}
