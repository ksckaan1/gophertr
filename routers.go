package main

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func homepage(c *fiber.Ctx) error {

	return c.Render("index", fiber.Map{
		"access": checkAccess(c),
	})
}

func addGopher(c *fiber.Ctx) error {
	return c.Render("add-gopher", nil)
}

func editGopher(c *fiber.Ctx) error {
	id := c.Params("id")
	return c.Render("edit-gopher", fiber.Map{
		"gopherid": id,
	})
}

func editRequest(c *fiber.Ctx) error {
	id := c.Params("id")
	return c.Render("edit-request", fiber.Map{
		"gopherid": id,
	})
}

func readme(c *fiber.Ctx) error {
	return c.Render("readme", nil)
}

func loginGM(c *fiber.Ctx) error {
	return c.Render("login", nil)
}

func loginPM(c *fiber.Ctx) error {
	var data userData

	if err := c.BodyParser(&data); err != nil {
		c.Status(http.StatusBadGateway).JSON(fiber.Map{
			"message": "Error when login process",
		})
	}
	if data.ID == adminID && data.Pass == adminPass {
		c.Cookie(&fiber.Cookie{
			Name:  "access",
			Value: data.ID + data.Pass,
		})
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message": "success",
		})
	}
	return c.Status(http.StatusBadRequest).JSON(fiber.Map{
		"message": "error",
	})
}

func logoutGM(c *fiber.Ctx) error {
	c.ClearCookie("access")
	return c.Redirect("/")
}

func accessController(c *fiber.Ctx) error {
	if checkAccess(c) {
		return c.Next()
	}
	return c.Redirect("/login")
}

func dashboard(c *fiber.Ctx) error {
	return c.Render("dashboard", nil)
}
