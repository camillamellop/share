export default function WorldMap() {
  return (
    <div className="absolute inset-0 z-0 opacity-10">
      <svg
        viewBox="0 0 1200 600"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/20"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Radar circles */}
        <circle cx="600" cy="300" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/30" />
        <circle cx="600" cy="300" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/30" />
        <circle cx="600" cy="300" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/30" />
        <circle cx="600" cy="300" r="400" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/30" />

        {/* Simplified world map silhouette */}
        <g className="text-cyan-500/30" fill="currentColor">
          {/* North America */}
          <path d="M150,120 Q180,100 220,110 Q260,105 290,120 Q320,130 340,150 Q350,180 330,200 Q300,220 270,210 Q240,200 210,190 Q180,180 160,160 Q140,140 150,120Z"/>
          
          {/* South America */}
          <path d="M200,280 Q220,260 240,270 Q260,280 270,300 Q280,340 275,380 Q270,420 260,450 Q250,480 240,500 Q230,520 220,510 Q210,500 205,480 Q200,460 195,440 Q190,420 185,400 Q180,380 175,360 Q170,340 175,320 Q180,300 190,290 Q195,285 200,280Z"/>
          
          {/* Europe */}
          <path d="M480,140 Q500,130 520,135 Q540,140 560,150 Q580,160 590,180 Q585,200 570,210 Q550,215 530,210 Q510,205 490,195 Q470,185 465,165 Q470,145 480,140Z"/>
          
          {/* Africa */}
          <path d="M500,220 Q520,210 540,215 Q560,220 580,230 Q600,250 605,280 Q610,320 605,360 Q600,400 590,430 Q580,450 570,460 Q550,470 530,465 Q510,460 495,450 Q480,440 470,420 Q460,400 455,380 Q450,360 455,340 Q460,320 470,300 Q480,280 490,260 Q495,240 500,220Z"/>
          
          {/* Asia */}
          <path d="M600,120 Q640,110 680,115 Q720,120 760,130 Q800,140 840,155 Q880,170 900,190 Q920,210 915,230 Q910,250 895,265 Q880,280 860,285 Q840,290 820,285 Q800,280 780,270 Q760,260 740,250 Q720,240 700,230 Q680,220 660,210 Q640,200 620,185 Q600,170 595,150 Q590,130 600,120Z"/>
          
          {/* Australia */}
          <path d="M800,380 Q820,375 840,380 Q860,385 875,395 Q890,405 895,420 Q890,435 875,445 Q860,450 845,445 Q830,440 815,430 Q800,420 795,405 Q790,390 800,380Z"/>
        </g>
        
        {/* Flight paths */}
        <g className="text-cyan-400/40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5">
          {/* Flight path 1: North America to Europe */}
          <path d="M250,160 Q350,120 480,150">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="3s" repeatCount="indefinite"/>
          </path>
          
          {/* Flight path 2: Europe to Asia */}
          <path d="M520,160 Q650,140 780,170">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="4s" repeatCount="indefinite"/>
          </path>
          
          {/* Flight path 3: Asia to Australia */}
          <path d="M800,200 Q850,280 850,380">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="5s" repeatCount="indefinite"/>
          </path>
          
          {/* Flight path 4: North America to South America */}
          <path d="M280,200 Q250,240 220,280">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="3.5s" repeatCount="indefinite"/>
          </path>
          
          {/* Flight path 5: Europe to Africa */}
          <path d="M520,200 Q510,210 520,250">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite"/>
          </path>
        </g>
        
        {/* Airplane icons */}
        <g className="text-cyan-400/60" fill="currentColor">
          {/* Airplane 1 */}
          <g transform="translate(350,140) rotate(45)">
            <path d="M0,-8 L-2,-6 L-8,-4 L-8,-2 L-2,0 L-2,4 L-4,6 L-4,8 L0,6 L4,8 L4,6 L2,4 L2,0 L8,-2 L8,-4 L2,-6 Z"/>
            <animateTransform attributeName="transform" type="translate" values="300,140;400,130;500,150" dur="6s" repeatCount="indefinite"/>
          </g>
          
          {/* Airplane 2 */}
          <g transform="translate(650,155) rotate(90)">
            <path d="M0,-8 L-2,-6 L-8,-4 L-8,-2 L-2,0 L-2,4 L-4,6 L-4,8 L0,6 L4,8 L4,6 L2,4 L2,0 L8,-2 L8,-4 L2,-6 Z"/>
            <animateTransform attributeName="transform" type="translate" values="600,155;700,150;800,170" dur="8s" repeatCount="indefinite"/>
          </g>
          
          {/* Airplane 3 */}
          <g transform="translate(825,290) rotate(135)">
            <path d="M0,-8 L-2,-6 L-8,-4 L-8,-2 L-2,0 L-2,4 L-4,6 L-4,8 L0,6 L4,8 L4,6 L2,4 L2,0 L8,-2 L8,-4 L2,-6 Z"/>
            <animateTransform attributeName="transform" type="translate" values="800,250;825,320;850,380" dur="10s" repeatCount="indefinite"/>
          </g>
        </g>
        
        {/* Location markers */}
        <g className="text-cyan-400" fill="currentColor">
          <circle cx="250" cy="160" r="3">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="520" cy="160" r="3">
            <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="780" cy="170" r="3">
            <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="850" cy="380" r="3">
            <animate attributeName="r" values="3;5;3" dur="3.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    </div>
  );
}
