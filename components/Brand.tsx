import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";

const Brand = ({showname = true}) => {
  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="flex items-center space-x-2">
        {/* <Image src="/images/logo.png" alt="Citixo" width={52} height={52} /> */}
        {/* <span className="text-xl font-semibold text-white">Citixo</span> */}
        <Image src="/images/logo.jpeg" alt="Citixo" className="rounded-full" width={52} height={52} />
      </Link>

    {showname && <div className="text-xl font-semibold text-gray-900 text-bold">Citixo</div>}

    </div>
  );
};

export default memo(Brand);
