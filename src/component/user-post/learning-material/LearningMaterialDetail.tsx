import React, {useState, useEffect} from "react";
import axios, {AxiosResponse} from "axios";
import {IconFile} from "@tabler/icons-react";
import JSZip from "jszip";

import {
    Text,
    Group,
    Badge,
    Box,
    Card,
    CardSection,
    Divider,
    Center,
    Container,
    Title,
    List,
    ListItem,
    Button, TypographyStylesProvider,
} from "@mantine/core";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {format} from "date-fns";
import {useParams} from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./styles.css";
import {
    Captions,
    Download,
    Fullscreen,
    Thumbnails,
    Zoom,
} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {loadingIndicator} from "../../../App.tsx";

interface Post {
    id: number;
    postTime: string;
    title: string;
    status: string | null;
    username: string;
    subjectCode: string;
    test: boolean;
    content: string;
    filenames: string[];
}

interface ImageItem {
    src: string;
    title: string;
    description: string | null;
}

const LearningMaterialDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();

    const [post, setPost] = useState<Post | null>(null);
    const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});
    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response: AxiosResponse<Post> = await axios.get(
                    `https://api.fu4s.online/api/v1/learningMaterial/getById?id=${id}`
                );
                setPost(response.data);
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };

        fetchPost();
    }, [id]);

    useEffect(() => {
        const fetchFileLinks = async () => {
            if (post && post.filenames.length > 0) {
                const urls: { [key: string]: string } = {};
                for (const file of post.filenames) {
                    const response = await fetch(
                        `https://api.fu4s.online/api/v1/learningMaterial/getFile?id=${id}&filename=${file}`
                    );
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    urls[file] = url;
                }
                setFileUrls(urls);
            }
        };

        fetchFileLinks();
    }, [post, id]);

    if (!post) {
        return loadingIndicator;
    }

    const handleDownloadMultipleFilesAsZip = async (filenames: string[]) => {
        const zip = new JSZip();

        // Fetch all the URLs for the files
        const filePromises = filenames.map(async (filename) => {
            const url = await fetchFileLink(filename);
            const response = await fetch(url);
            const blob = await response.blob();
            return {filename, blob};
        });

        const files = await Promise.all(filePromises);

        // Add each file to the zip
        files.forEach((file) => {
            zip.file(file.filename, file.blob);
        });

        // Generate the zip file
        const content = await zip.generateAsync({type: "blob"});

        // Create a link to download the zip file
        const link = document.createElement("a");
        const zipFilename = "files.zip";
        link.href = URL.createObjectURL(content);
        link.setAttribute("download", zipFilename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    };

    const handleDownloadOldFile = async (filename: string) => {
        const url = await fetchFileLink(filename);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();

        link.parentNode?.removeChild(link);
    };

    const fetchFileLink = async (filename: string): Promise<string> => {
        const response = await fetch(
            `https://api.fu4s.online/api/v1/learningMaterial/getFile?id=${id}&filename=${filename}`
        );
        const file = await response.blob();

        const url = window.URL.createObjectURL(new Blob([file]));
        return url;
    };

    // Initialize empty lists for images and other files
    const imageList: ImageItem[] = [];
    const fileList: string[] = [];

    // Iterate over filenames and categorize them
    post.filenames.forEach((file) => {
        const url = fileUrls[file];
        const isImage =
            url &&
            (file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".png") ||
                file.endsWith(".gif"));

        if (isImage) {
            imageList.push({
                src: url,
                title: file,
                description: null,
            });
        } else {
            fileList.push(file);
        }
    });

    return (
        <Center>
            <Container size={"xl"} mt={"xl"}>
                <Card withBorder shadow="sm" padding="xl">
                    <CardSection>
                        <Title order={2} ta={"center"} component="div" mb={2} p={"md"}>
                            {post.title}
                        </Title>
                    </CardSection>
                    <Divider size="xs"/>
                    <Group justify="space-between">
                        <Text fw={700} size="lg">
                            {post.username}
                        </Text>
                        <Text c="dimmed" p={"md"}>
                            {format(new Date(post.postTime), "dd/MM/yyyy HH:mm")}
                        </Text>
                    </Group>
                    <CardSection>
                        <Box w={600}>
                            <TypographyStylesProvider fw={400} mt="md" p={"lg"} m="20">
                                <ReactQuill
                                    value={post.content}
                                    readOnly={true}
                                    theme="bubble"
                                />
                            </TypographyStylesProvider>

                            <Divider my="sm" variant="dotted"/>

                            <Group display="flex" justify="space-between" m={2}>
                                <Text size="l" fw={800} m="20">
                                    Attachments
                                </Text>

                                <Button
                                    onClick={() =>
                                        handleDownloadMultipleFilesAsZip(post.filenames)
                                    }
                                    variant="light"
                                    size="xs"
                                >
                                    Download All
                                </Button>
                            </Group>

                            <div className="images-container">
                                {imageList.map((image, idx) => (
                                    <div
                                        key={idx}
                                        className="image"
                                        onClick={() => setIndex(idx)}
                                    >
                                        <img src={image.src} alt={image.title}/>
                                    </div>
                                ))}
                            </div>

                            <Box m="20">
                                <List>
                                    {fileList.map((file, index) => (
                                        <ListItem key={index} mb="xs">
                                            <Button
                                                leftSection={<IconFile
                                                    size={14}/>} // leftSection thành leftIcon trong Chakra UI
                                                onClick={() => handleDownloadOldFile(file)}
                                            >
                                                {file}
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            <Lightbox
                                plugins={[Captions, Download, Fullscreen, Zoom, Thumbnails]}
                                captions={{
                                    showToggle: true,
                                    descriptionTextAlign: "end",
                                }}
                                index={index}
                                open={index >= 0}
                                close={() => setIndex(-1)}
                                slides={imageList}
                            />
                        </Box>
                    </CardSection>
                    <Divider my="sm" variant="dotted"/>

                    <Group justify="space-between">
                        {post.test ? (
                            <Badge color="indigo">Mock Test</Badge>
                        ) : (
                            <Badge color="pink">Learning material</Badge>
                        )}

                        <Box>
                            <Text variant="body2" ml={1}>
                                Love
                            </Text>
                            <Text variant="body2" ml={1}>
                                Comment
                            </Text>
                            <Text variant="body2" ml={1}>
                                Share
                            </Text>
                        </Box>
                    </Group>
                    <Text mt="xs" c="dimmed" size="sm"></Text>
                </Card>
            </Container>
        </Center>
    );
};

export default LearningMaterialDetail;
