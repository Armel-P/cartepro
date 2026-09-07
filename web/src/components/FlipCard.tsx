import { useState } from "react";

import QRCodeComponent from "./QrCode";
import { getUser } from "../auth";

interface BankCardProps {
  paymentUrl: string;
}

export default function BankCard({ paymentUrl }: BankCardProps) {
  const [flipped, setFlipped] = useState(false);
  const user = getUser();

  return (
    <div
      className="
        w-[calc(100vw-32px)]
        max-w-150
        aspect-[1.586/1]
        cursor-pointer
        select-none
      "
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <div
        className={`
          relative
          w-full
          h-full
          transition-transform
          duration-700
          transform-3d
          ${flipped ? "transform-[rotateY(180deg)]" : ""}
        `}
      >
        {/* RECTO */}
        <div
          className="
            absolute
            inset-0
            rounded-2xl
            overflow-hidden
            shadow-2xl
            p-[6%]
            backface-hidden
          "
          style={{ backgroundColor: "#7E2534" }}
        >
          {/* Logo central */}
          <img
            src="/public/blue_logo.png"
            alt="CartePro"
            className="
              absolute
              left-3/5
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[clamp(80px,30%,200px)]
              h-auto
              object-contain
              pointer-events-none
            "
          />

          <div className="flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                { }
              </div>

              <img
                src="/public/cartepro.png"
                alt="CartePro"
                className="
                  h-[clamp(18px,5vw,40px)]
                  w-auto
                  object-contain
                "
              />
            </div>

            {/* PUCE */}
            <div
              className="
                absolute
                left-[6%]
                top-[calc(6%+clamp(10px,4vw,25px)+1rem)]
                w-[13%]
                aspect-[1.4/1]
                rounded-md
                bg-linear-to-br
                from-yellow-200
                via-yellow-400
                to-yellow-600
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  inset-x-0
                  top-1/2
                  h-px
                  bg-yellow-700/50
                "
              />

              <div
                className="
                  absolute
                  inset-y-0
                  left-1/2
                  w-px
                  bg-yellow-700/50
                "
              />
            </div>

            <div className="m-16">
              { }
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div>
                <p
                  className="
                    text-white/50
                    uppercase
                    text-[clamp(7px,2vw,12px)]
                  "
                >
                  Propriétaire:
                </p>

                <p
                  className="
                    text-white
                    font-medium
                    text-[clamp(11px,3vw,16px)]
                  "
                >
                  {user?.name ?? "Invité"}
                </p>
              </div>

              <div>
                <p
                  className="
                    text-white/50
                    uppercase
                    text-[clamp(7px,2vw,12px)]
                  "
                >
                  Date de création:
                </p>

                <p
                  className="
                    text-white
                    font-medium
                    text-[clamp(11px,3vw,16px)]
                  "
                >
                  JJ / MM / AAAA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DOS */}
        <div
          className="
            absolute
            inset-0
            rounded-2xl
            overflow-hidden
            shadow-2xl
            backface-hidden
            transform-[rotateY(180deg)]
          "
          style={{ backgroundColor: "#7E2534" }}
        >
          {/* Bande magnétique */}
          <div
            className="
              absolute
              top-[10%]
              left-0
              right-0
              h-[12%]
              bg-black
            "
          />

          {/* Contenu du dos */}
          <div
            className="
              absolute
              inset-x-0
              top-[27%]
              bottom-[5%]
              flex
              flex-col
              items-center
              justify-center
              gap-[4%]
            "
          >
            {/* QR Code */}
            <div
              className="
                w-[40%]
                max-w-45
                min-w-22.5
                aspect-square
                bg-white
                p-[2%]
                rounded-lg
                shadow-lg
                flex
                items-center
                justify-center
                z-10
              "
            >
              <QRCodeComponent value={paymentUrl} maxSize={200} />
            </div>

            {/* Texte */}
            <div
              className="
                text-white
                font-medium
                tracking-widest
                text-center
                text-[clamp(9px,2.5vw,14px)]
              "
            >
              SCANNER POUR PAYER
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
