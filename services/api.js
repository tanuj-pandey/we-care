import axios from 'axios';

const api = axios.create({
  baseURL: 'https://springboot-demo-bcdiruu6wq-uc.a.run.app'
});

export const getAPI = async (url) => {
  console.log("API URL---", url);
  try {
    const response = await api.get(url);
    console.log("API response---", response);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const postAPI = async (url, post) => {
  console.log("API URL---", url);
  console.log("POST data-----", post);
  try {
    const response = await api.post(url, post);
    console.log("API response---", response);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
