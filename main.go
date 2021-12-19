package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/encryptcookie"
	"github.com/gofiber/template/html"
)

func init() {
	mongodbUser = os.Getenv("mongodbuser")
	mongodbPass = os.Getenv("mongodbpass")
	twitterToken = os.Getenv("twittertoken")
	encryptKey = os.Getenv("encryptkey")
	adminPass = os.Getenv("adminpass")
	adminID = os.Getenv("adminid")
}

func main() {
	//Create Template renderer engine
	engine := html.New("./templates", ".html")

	//Create new fiber app
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Use(encryptcookie.New(encryptcookie.Config{
		Key: encryptKey,
	}))

	//Serve public files
	app.Static("/public", "./public")

	//Homepage Router
	app.Get("/", homepage)

	//Add Gopher Page Route
	app.Get("/add", addGopher)

	admin := app.Group("/admin", accessController)

	//admin dashboard page route
	admin.Get("/dash", dashboard)

	//Edit Gopher Page Route
	admin.Get("/edit/:id", editGopher)

	//Request Edit Gopher Page Route
	app.Get("/edit-request/:id", editRequest)

	//Readme Page Route
	app.Get("/readme", readme)

	//session management
	//login
	app.Get("/login", loginGM)
	app.Post("/login", loginPM)

	//logout
	app.Get("/logout", logoutGM)

	//APIs
	app.Post("/api/tw/", twapi)                                 //Fetch Twitter Info
	app.Get("/api/gophers", listAllGophersAPI)                  //list all gophers
	app.Get("/api/gopher/:id", singleGopherAPI)                 //fetch single gopher data
	app.Post("/api/gopher/add", addGopherAPI)                   //add gopher api
	admin.Post("/api/gopher/edit", editGopherAPI)               //edit gopher api
	admin.Get("/api/gopher/delete/:id", deleteGopherAPI)        //delete gopher api
	app.Post("/api/gopher/edit-request", editRequestAPI)        //edit request gopher api
	app.Get("/api/gopher/delete-request/:id", deleteRequestAPI) //delete gopher api
	admin.Get("/api/requests", getRequests)                     //List all requests
	admin.Get("/api/request/delete/:id", deleteReqAPI)          // delete a request

	//Listen and serve
	log.Fatalln(app.Listen(":5555"))
}
