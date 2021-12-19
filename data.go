package main

import "go.mongodb.org/mongo-driver/bson/primitive"

//Gopher Struct
type Gopher struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name          string             `bson:"name,omitempty" json:"name,omitempty"`
	Company       string             `bson:"company,omitempty" json:"company,omitempty"`
	Description   string             `bson:"description,omitempty" json:"description,omitempty"`
	Social        SocialNetworks     `bson:"social,omitempty" json:"social,omitempty"`
	ProfileImgURL string             `bson:"profile_img_url,omitempty" json:"profile_img_url,omitempty"`
	JobStatus     string             `bson:"job_status,omitempty" json:"job_status,omitempty"`
}

//Social Network Struct
type SocialNetworks struct {
	GitHub    string `bson:"github,omitempty" json:"github,omitempty"`
	GitLab    string `bson:"gitlab,omitempty" json:"gitlab,omitempty"`
	Twitter   string `bson:"twitter,omitempty" json:"twitter,omitempty"`
	Facebook  string `bson:"facebook,omitempty" json:"facebook,omitempty"`
	YouTube   string `bson:"youtube,omitempty" json:"youtube,omitempty"`
	Telegram  string `bson:"telegram,omitempty" json:"telegram,omitempty"`
	Instagram string `bson:"instagram" json:"instagram,omitempty"`
	LinkedIn  string `bson:"linkedin,omitempty" json:"linkedin,omitempty"`
	Reddit    string `bson:"reddit,omitempty" json:"reddit,omitempty"`
	EMail     string `bson:"email,omitempty" json:"email,omitempty"`
	Kommunity string `bson:"kommunity,omitempty" json:"kommunity,omitempty"`
	Website   string `bson:"website,omitempty" json:"website,omitempty"`
}

//Twitter Info Struct
type IncomingTwitterinfo struct {
	Username string `json:"username"`
}

type requestData struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	OldData      Gopher             `bson:"old_data,omitempty" json:"old_data,omitempty"`
	NewData      Gopher             `bson:"new_data,omitempty" json:"new_data,omitempty"`
	ReqType      string             `bson:"req_type,omitempty" json:"req_type,omitempty"`
	AvatarMethod string             `bson:"avatar_method,omitempty" json:"avatar_method,omitempty"`
}

type gopherReq struct {
	AvatarMethod string `json:"avatar_method"`
	GopherData   Gopher `json:"gopher"`
}

type userData struct {
	ID   string `json:"id"`
	Pass string `json:"pass"`
}
