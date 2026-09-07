import MediaCard from "../../components/ui/mediacard";
import { PARTNERS } from "../../data/partners";
import "../../assets/css/global.css";

export default function EmployeePartnersPage() {
  return (
    <main className="mt-10 px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          justify-items-center
          gap-y-20
          md:gap-x-10
          lg:gap-x-6
        "
      >
        {PARTNERS.map((partner, index) => (
          <div
            key={partner.id}
            className="animate-card-in"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            <MediaCard
              name={partner.name}
              type={partner.type}
              address={partner.address}
              description={partner.description}
              image={partner.image}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
