import {Title} from "@mantine/core";
import {HeroContent, HeroContent2} from "../../component/hero/HeroContent";
import DocumentTitle from "../../component/document-title/DocumentTitle";
import React from "react";

export default function LandingPage() {
    DocumentTitle("FU-4S");
    return (
        <div className="overflow-x-hidden">
            <HeroContent/>
            <div className="p-10 mx-auto">
                <Title className="text-center text-4xl">
                    About us
                </Title>
            </div>
            <HeroContent2/>
        </div>
    ) as React.ReactElement;
}
