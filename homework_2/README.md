# MovieLens Recommendation System 
This repository contains functions and scripts for working with the MovieLens 1M dataset and performing offline tasks for a recommendation system using BERT embeddings. 
This includes uploading data to S3, creating embeddings, generating recommendations, and testing on a user-defined profile. 

## Packages 
The notebook requires boto3, numpy, pandas, scikit-learn, and datarec. 

## Other Prerequisites
To connect to S3 bucket on AWS, the user needs an access key, secret access key, session token, and default region. These should be stored on a local text file instead of written in the function. The code will read from this text file to obtain the necessary credentials to upload to S3. 

# How to run the code: 
All necessary steps such as loading the data and accessing embeddings are included in the functions. As such, the user only needs to run the separate script for reading AWS credentials, then can run each function call sequentially as long as the AWS credentials remain valid. 

# Task 1: Upload MovieLens to S3

The function upload_movielens downloads the MovieLens 1M dataset from datarec and uploads the extracted files to the S3 bucket. Additionally, it checks if the files already exist in S3 and skips uploading if they do. 
The inputs are bucketname - the name of the target S3 bucket, s3_prefix - the S3 folder path to store the data, tmp_dir - the local temporary directory to store files.
The outputs are dataset files uploaded to S3 under <bucketname>/<s3_prefix>. 

Note that the script for obtaining AWS credentials from a local file must be run before this function is called. 

# Task 2: Create Movie Embeddings (BERT) 
The function bert_movie_embeddings generates BERT embeddings for movies using a random subset of users. The embeddings are uploaded to S3. This is intended to be ran offline only once per set of embeddings. 
Many of the inputs follow the same format as Task 1, such as bucketname, s3_prefix, and tmp_dir. Another input is user_fraction which determines what percentage of the data is sampled. (1.0 is 100%, 0.3 is 30%)
The outputs are movie_embeddings.npy - a numpy array of movie embeddings, movie_ids.json - a mapping of movie IDs to indices in json file, and an upload of the embeddings to the s3 bucket. 

# Task 3: Generate Recommendations for Cold and Top Users
The function recommend_movies generates 5 movie recommendations for two types of users: a cold user with no historical interactions and a top user in the top 5% most active users. The recommendations include user type, last interaction time, summaries, and recommended movies. These are uploaded to S3. 
The bucketname, tmp_dir, and rec_prefix are consistent with the previous functions. emb_prefix specifies the S3 folder with the embeddings to use. 
The outputs are a JSON file for recommendations which is temporarily stored locally and uploaded to the S3 bucket. 

# Task 4: Repeat embedding and recommendations for full dataset 
For this task, bert_movie_embeddings is called with the same inputs but using 1.0 for user_fraction instead of 0.3. The results are stored in a different folder in the S3 bucket, denoted as bert_full. 
Then, the recommend_movies function is called again using the new embeddings. The input and output types are the same as those in Tasks 2 and 3. 

# Task 5: Create recommendations for User-defined profiles 
The function create_user_profile includes user-defined ratings of 10 movies and generates 5 personalized recommendations based on these ratings. These recommendations are saved locally and uploaded in the S3 bucket as a json file. The user profile is also uploaded as a json file. 
The inputs bucketname, emb_prefix, rec_key, tmp_dir are consistent with previous tasks. Another input is profile_key for storing the user profile information on S3 as well. 
The outputs are two json files. self_profile.json contains the user profile information with rated movies. self_recommendations.json contains the top 5 recommended movies formatted in the same way as those output by the recommend_movies function. 

