package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type twInfo struct {
	Description string `json:"description"`
	PPImg       string `json:"profile_image_url_https"`
}

func getTwInfo(username string) twInfo {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://api.twitter.com/1.1/users/show.json?screen_name="+username, nil)

	if err != nil {
		log.Fatalln(err)
	}
	req.Header.Set("authorization", "Bearer "+twitterToken)
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}

	res, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Println(err)
	}

	var userInfo twInfo

	json.Unmarshal(res, &userInfo)
	userInfo.PPImg = strings.ReplaceAll(userInfo.PPImg, "normal", "bigger")
	return userInfo
}

func checkAccess(c *fiber.Ctx) bool {
	return adminID+adminPass == c.Cookies("access")
}
