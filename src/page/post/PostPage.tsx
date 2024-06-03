import React, {useState, useEffect} from "react";
import axios, { AxiosResponse } from "axios";
import {
  Text,
  Container,
  Title, Space, Textarea, Button,
} from "@mantine/core";

import Comment from "../../component/comment/CommentTag";
import {useParams} from "react-router-dom";
import LearningMaterialDetail from "../../component/learning-material/LearningMaterialDetail";
import MockTestDetail from "../../component/mock-test/MockTestDetail";
import {forEach} from "lodash";
import {useForm} from "@mantine/form";
import {format} from "date-fns";

interface Post {
  id: number;
  postTime: string;
  title: string;
  status: string | null;
  username: string;
  subjectCode: string;
  test: boolean;
}

export interface CommentData {
  id: number;
  date: Date;
  account: string;
  username: string;
  content: string;
  status: string;
  isMine: boolean;
}

const PostPage: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      'date': format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss.SSS+SS:SS"),
      'username': localStorage.getItem("username"),
      'content': '',
    },
    validate: {
      content: (value: string) => (/^\S/.test(value) ? null : 'Invalid content'),
    },
  });

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentData[] | null>([]);


  const isStaff = ["STAFF", "ADMIN"].includes((localStorage.getItem("role") + ""));
  const fetchPost = async () => {
    try {
      const response: AxiosResponse<Post> = await axios.get(
          `http://localhost:8080/api/v1/post/get?id=${id}`
      );
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };
  const fetchComments = async () => {
    try {
      const response: AxiosResponse<CommentData[]> = await axios.get(
          `http://localhost:8080/api/v1/comments/post/${id}` + (isStaff && "?isStaff=true")
      )
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comment:", error);
    }
  }
  useEffect(() => {
    fetchPost();
    fetchComments()
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }



  return <>
    {!post.test && <LearningMaterialDetail />}
			{post.test && <MockTestDetail />}
    <Space h={"md"}/>
    <Container>
      <Title order={2}>Comment section</Title>
      {(comments == null || comments?.length == 0) ? <Text>No comments</Text> : <></>}
      {forEach(comments)?.map(
          c => {
            return <Comment key={c.id} id={c.id} username={c.username} content={c.content} date={c.date}
                            isMine={c.account == localStorage.getItem("username")}
                            account={c.account} status={c.status}
            />
          })}
      <form onSubmit={form.onSubmit(async (values) => {
        console.log(values);
        try {
          const response: AxiosResponse<string> = await axios.post(
              `http://localhost:8080/api/v1/comments/upload/post-${id}`,
              values,
              {
                headers: {Authorization: "Bearer " + localStorage.getItem("token")}
              }
          )
          if (response.status == 200) {
            await fetchComments();
            form.reset();
          }
        } catch (error) {
          console.error("Error posting comment:", error);
        }
      })}>
        <Textarea size={"md"} my={"md"} placeholder={"Your comment"} autosize
                  minRows={2}
                  maxRows={4}
                  key={form.key('content')}
                  {...form.getInputProps('content')}
        ></Textarea>
        <Button type={"submit"}>Comment</Button>
      </form>
    </Container>
  </>
};

export default PostPage;