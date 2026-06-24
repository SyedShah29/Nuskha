import {
  Activity,
  Heart,
  ShieldPlus,
  Stethoscope,
} from "lucide-react";

const logos = [
  { icon: Activity, name: "MedCore", subtitle: "Hospital" },
  { icon: Heart, name: "Greenline", subtitle: "Health System" },
  { icon: ShieldPlus, name: "LifeCare", subtitle: "Institute" },
  { icon: Stethoscope, name: "NovaMed", subtitle: "Network" },
];

export const TrustedBy = () => {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Trusted by leading healthcare
          </p>

          <div className="flex-1 flex flex-wrap items-center justify-center md:justify-around gap-8 md:gap-12 opacity-40">
            {logos.map(({ icon: Icon, name, subtitle }) => (
              <div
                key={name}
                className="flex items-center gap-3 text-xl text-gray-600 font-bold tracking-tight"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  {name}{" "}
                  <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 block -mt-1">
                    {subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
