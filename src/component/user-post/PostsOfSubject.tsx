import {Carousel} from "@mantine/carousel";
import {
    Card,
    Text,
    Badge,
    Group,
    Stack,
    Avatar,
    ActionIcon,
    Flex,
} from "@mantine/core";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {IconDots} from "@tabler/icons-react";
import {BASE_URL} from "../../common/constant";

export interface Post {
    id: number;
    title: string;
    result: number;
    postTime: Date;
    username: string;
    test: boolean;
    subjectCode: string;
}

interface PostsOfAuthor {
    thisSubject: string;
}

const PostsOfSubject: React.FC<PostsOfAuthor> = ({thisSubject}) => {
    const [post, setPost] = useState<Post[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}/api/v1/post/subject/${thisSubject}`
                );
                const sortedList = res.data
                    ? res.data.sort(
                        (
                            a: { date: string | number | Date },
                            b: { date: string | number | Date }
                        ) => {
                            const timeA = new Date(a.date).getTime();
                            const timeB = new Date(b.date).getTime();
                            return timeB - timeA; // Sort in descending order for most completed views first
                        }
                    )
                    : [];
                setPost(sortedList);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [thisSubject]);

    function fetchMore(offset: number) {
        axios
            .get(`${BASE_URL}/api/v1/post/subject/${thisSubject}&offset=${offset}`)
            .then((res) => {
                const sortedList = res.data
                    ? res.data.sort(
                        (
                            a: { date: string | number | Date },
                            b: { date: string | number | Date }
                        ) => {
                            const timeA = new Date(a.date).getTime();
                            const timeB = new Date(b.date).getTime();
                            return timeB - timeA; // Sort in descending order for most completed views first
                        }
                    )
                    : [];
                setPost((list) => list.concat(sortedList));
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    return (
        <>
            {post.length === 0 ? null : (
                <>
                    <Carousel
                        slideSize={"25%"}
                        height={"150px"}
                        align={"start"}
                        slideGap="md"
                        controlsOffset="xs"
                        controlSize={30}
                        dragFree
                    >
                        {post.map((test, index) => (
                            <Carousel.Slide key={index}>
                                <Card
                                    miw={"300px"}
                                    maw={"300px"}
                                    shadow="sm"
                                    radius="md"
                                    padding={"lg"}
                                    withBorder
                                    component="a"
                                    className="h-full"
                                    onClick={() => {
                                        window.location.href = `/post/${test.id}`
                                    }}
                                    onContextMenu={(e) => e.stopPropagation()}
                                    style={{cursor: "pointer"}}
                                >
                                    <Stack>
                                        <Stack gap={2}>
                                            <Text fw={360} truncate="end">
                                                {test.title}
                                            </Text>
                                            <Text fw={200} fz={12}>
                                                {test.postTime.toString().substring(0, 10)}
                                            </Text>
                                            {test.test ? (
                                                <Badge color="indigo">Mock Test</Badge>
                                            ) : (
                                                <Badge color="pink">Learning Material</Badge>
                                            )}
                                        </Stack>
                                        <Group
                                            align="stretch"
                                            gap="sm"
                                            style={{marginBottom: "10px"}}
                                        >
                                            <Avatar
                                                variant="filled"
                                                radius="xl"
                                                size="sm"
                                                style={{
                                                    height: "110%",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    width: "10%",
                                                }}
                                            />
                                            <Text size="sm">{test.username}</Text>
                                            <Stack gap={2}>
                                                <Badge
                                                    color="blue"
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "1px 8px",
                                                        borderRadius: "999px",
                                                        fontSize: "12px",
                                                        fontWeight: "500",
                                                        textTransform: "uppercase",
                                                        width: "100%",
                                                    }}
                                                >
                                                    {test.subjectCode}
                                                </Badge>
                                            </Stack>
                                        </Group>
                                    </Stack>
                                </Card>
                            </Carousel.Slide>
                        ))}
                        {post.length > 0 && (
                            <Carousel.Slide>
                                <Flex p={"lg"} className="h-full" align={"center"}>
                                    <ActionIcon
                                        variant="default"
                                        aria-label="Dots"
                                        radius={"xl"}
                                        size={"xl"}
                                        onClick={() => fetchMore(post.length)}
                                    >
                                        <IconDots stroke={1.5}/>
                                    </ActionIcon>
                                </Flex>
                            </Carousel.Slide>
                        )}
                    </Carousel>
                </>
            )}
        </>
    );
};

export default PostsOfSubject;
