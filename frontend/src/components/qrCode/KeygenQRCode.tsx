import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import styles from "./KeygenQRCode.module.css"
interface KeygenQRCode {
    data: string
}
const KeygenQRCode: React.FC<KeygenQRCode> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className={`h-auto mx-auto max-w-xs w-full p-10 ${styles.qrContainer}`} >
                <QRCode
                    size={256}
                    className="h-auto max-w-full w-full rounded-lg"
                    value={data}
                    viewBox={`0 0 256 256`}
                />
            </div>
        </>
    );
};

export default KeygenQRCode;
