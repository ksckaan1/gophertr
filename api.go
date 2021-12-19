package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//fetch twitter profile picture
func twapi(c *fiber.Ctx) error {
	body := new(IncomingTwitterinfo)
	if err := c.BodyParser(body); err != nil {
		fmt.Println(err)
	}
	return c.JSON(getTwInfo(body.Username))
}

//list all gophers
func listAllGophersAPI(c *fiber.Ctx) error {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("gopherlist")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)
	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer cur.Close(ctx)

	//Variables for Homapage
	var gopherList []Gopher
	for cur.Next(ctx) {
		var result Gopher
		err := cur.Decode(&result)
		if err != nil {
			return c.SendString(fmt.Sprintf("%v", err))
		}
		gopherList = append(gopherList, result)

	}
	if err := cur.Err(); err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	return c.JSON(gopherList)
}

//fetch single gopher

func singleGopherAPI(c *fiber.Ctx) error {

	pGopherID := c.Params("id")

	gopherID, err := primitive.ObjectIDFromHex(pGopherID)

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ error when converting ObjectID",
		})
	}

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("gopherlist")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)

	var result Gopher
	err = collection.FindOne(ctx, bson.M{"_id": gopherID}).Decode(&result)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"message": "❌ gopher does not exist",
		})
	}
	return c.Status(http.StatusOK).JSON(result)
}

// Add Gopher API
func addGopherAPI(c *fiber.Ctx) error {

	//parse incoming body
	body := new(gopherReq)

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Hata Oluştu",
		})
	}

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("gopherlist")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)

	if body.AvatarMethod == "twitter" && body.GopherData.Social.Twitter != "" {
		twInfo := getTwInfo(body.GopherData.Social.Twitter)

		body.GopherData.ProfileImgURL = twInfo.PPImg
	}

	body.GopherData.ID = primitive.NilObjectID
	_, err = collection.InsertOne(ctx, body.GopherData)

	if err != nil {
		c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ Veritabanına Gopher Eklenirken Hata Oluştu",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Gopher Başarıyla Eklendi",
	})
}

func editGopherAPI(c *fiber.Ctx) error {
	//parse incoming body
	body := new(gopherReq)

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Hata Oluştu",
		})
	}

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("gopherlist")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)

	if body.AvatarMethod == "twitter" && body.GopherData.Social.Twitter != "" {
		twInfo := getTwInfo(body.GopherData.Social.Twitter)

		body.GopherData.ProfileImgURL = twInfo.PPImg
	}

	filter := bson.M{"_id": body.GopherData.ID}
	_, err = collection.ReplaceOne(ctx, filter, body.GopherData)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ Gopher düzenlenirken hata oluştu",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Gopher Başarıyla Düzenlendi",
	})

}

func deleteGopherAPI(c *fiber.Ctx) error {
	gopheridP := c.Params("id")

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("gopherlist")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)
	gopherid, err := primitive.ObjectIDFromHex(gopheridP)

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "id hatası",
		})
	}

	filter := bson.M{"_id": gopherid}
	_, err = collection.DeleteOne(ctx, filter)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"message": "Gopher bulunamadı",
		})
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Gopher başarıyla silindi",
	})
}

func getRequests(c *fiber.Ctx) error {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	collection := client.Database("gophertr").Collection("requests")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)
	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer cur.Close(ctx)

	//Variables for Homapage
	var reqList []requestData
	for cur.Next(ctx) {
		var result requestData
		err := cur.Decode(&result)
		if err != nil {
			return c.SendString(fmt.Sprintf("%v", err))
		}
		reqList = append(reqList, result)

	}
	if err := cur.Err(); err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	return c.JSON(reqList)
}

func editRequestAPI(c *fiber.Ctx) error {
	//parse incoming body
	body := new(gopherReq)

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Hata Oluştu",
		})
	}

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	var oldData Gopher

	gophersCollection := client.Database("gophertr").Collection("gopherlist")

	reqCollection := client.Database("gophertr").Collection("requests")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)

	err = gophersCollection.FindOne(ctx, bson.M{"_id": body.GopherData.ID}).Decode(&oldData)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"message": "Gopher bulunamadı",
		})
	}

	if body.AvatarMethod == "twitter" && body.GopherData.Social.Twitter != "" {
		twInfo := getTwInfo(body.GopherData.Social.Twitter)
		body.GopherData.ProfileImgURL = twInfo.PPImg
	}

	newReq := requestData{
		OldData:      oldData,
		NewData:      body.GopherData,
		ReqType:      "edit",
		AvatarMethod: body.AvatarMethod,
	}
	_, err = reqCollection.InsertOne(ctx, newReq)

	if err != nil {
		c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ Düzenleme isteği yapılırken hata oluştu",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Düzenleme isteği gönderildi",
	})
}

func deleteRequestAPI(c *fiber.Ctx) error {
	gopherIDParam := c.Params("id")
	gopherid, _ := primitive.ObjectIDFromHex(gopherIDParam)
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	/*
	   List databases
	*/
	var gopherData Gopher

	gophersCollection := client.Database("gophertr").Collection("gopherlist")

	reqCollection := client.Database("gophertr").Collection("requests")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)

	err = gophersCollection.FindOne(ctx, bson.M{"_id": gopherid}).Decode(&gopherData)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"message": "Gopher bulunamadı",
		})
	}

	newReq := requestData{
		OldData: gopherData,
		ReqType: "delete",
	}
	_, err = reqCollection.InsertOne(ctx, newReq)

	if err != nil {
		c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ Silme isteği yapılırken hata oluştu",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Silme isteği gönderildi",
	})
}

func deleteReqAPI(c *fiber.Ctx) error {
	reqIDParam := c.Params("id")
	reqid, _ := primitive.ObjectIDFromHex(reqIDParam)
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://" + mongodbUser + ":" + mongodbPass + "@cluster-frankfurt.4qfon.mongodb.net/gophertr?retryWrites=true&w=majority"))
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return c.SendString(fmt.Sprintf("%v", err))
	}
	defer client.Disconnect(ctx)

	reqCollection := client.Database("gophertr").Collection("requests")
	ctx, _ = context.WithTimeout(context.Background(), 30*time.Second)
	filter := bson.M{"_id": reqid}
	_, err = reqCollection.DeleteOne(ctx, filter)

	if err != nil {
		c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "❌ Error when deleting Request",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "✓ Request Deleted Successfully",
	})
}
