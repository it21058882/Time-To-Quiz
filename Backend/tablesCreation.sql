CREATE TABLE category_db(
	cat_id BIGSERIAL PRIMARY KEY,
	cat_name varchar(100),
	cat_image text,
	cat_order int
);


INSERT INTO category_db (cat_name,cat_image,cat_order) VALUES ('Buisness','https://cloudinary.hbs.edu/hbsit/image/upload/s--O0PXWnT3--/f_auto,c_fill,h_375,w_750,/v20200101/BDD0688FF02068E5C427B0954F8A2297.jpg',1);
INSERT INTO category_db (cat_name,cat_image,cat_order) VALUES ('Programing','https://history-computer.com/wp-content/uploads/2023/03/dynamic-programming-header-scaled.jpg',2);
INSERT INTO category_db (cat_name,cat_image,cat_order) VALUES ('Civil Engineering','https://discovere.org/wp-content/uploads/2021/10/STEM_Careers_Civil_Engineering-scaled.jpg',3);
INSERT INTO category_db (cat_name,cat_image,cat_order) VALUES ('Agriculture','https://www.worldbank.org/content/dam/photos/780x439/2022/feb/Paddies-image.jpg',4);


CREATE TABLE quiz_db (
	quiz_id BIGSERIAL PRIMARY KEY,
	quiz_name varchar(250),
	quiz_image text,
	quiz_desc text,
	quiz_aun_count int,
	quiz_cate_id int REFERENCES category_db(cat_id)	
)

INSERT INTO quiz_db (quiz_name,quiz_image,quiz_desc,quiz_aun_count,quiz_cate_id) VALUES ('Business analytics','https://emeritus.org/in/wp-content/uploads/sites/3/2023/12/what_is_business_analytics.png','Business analytics is the process of transforming data into insights to improve business decisions. Data management, data visualization, predictive modeling, data mining, forecasting simulation, and optimization are some of the tools used to create insights from data.',4,1);
INSERT INTO quiz_db (quiz_name,quiz_image,quiz_desc,quiz_aun_count,quiz_cate_id) VALUES ('c++ programming','https://training.digigrowhub.in/wp-content/uploads/2021/02/do-coding-of-any-program-by-c-plus-plus-perfectly-and-within-time.jpg','C++ is a high-level, general-purpose programming language created by Danish computer scientist Bjarne Stroustrup',6,2);
INSERT INTO quiz_db (quiz_name,quiz_image,quiz_desc,quiz_aun_count,quiz_cate_id) VALUES ('Python programming','https://ciracollege.com/wp-content/uploads/2020/11/How-to-Learn-Python.jpg','Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation. Python is dynamically typed and garbage-collected. It supports multiple programming paradigms, including structured, object-oriented and functional',6,2);



