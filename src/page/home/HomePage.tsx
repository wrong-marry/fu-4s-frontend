import DocumentTitle from "../../component/document-title/DocumentTitle.tsx";
import {Card, Container, Stack, Title} from "@mantine/core";
import RecentPost from "../../component/home/RecentPost.tsx";
import CompletedTest from "../../component/home/CompletedTest.tsx";
import UploadedPost from "../../component/home/UploadedPost.tsx";
import React from "react";


export default function HomePage() {
    DocumentTitle("FU-4S | Dashboard");

    return (
        <>
            <Container className="container">
                <Card>
                    <Stack gap="md">
                        <Title order={2}>Recent Posts</Title>
                        <RecentPost/>
                        <Title order={2}>Completed Tests</Title>
                        <CompletedTest/>
                        <Title order={2}>Uploaded Posts</Title>
                        <UploadedPost/>
                    </Stack>
                </Card>
            </Container>
        </>
    ) as React.ReactElement;
}