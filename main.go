package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/go-github/v62/github"
	"golang.org/x/oauth2"
)

type RepoInfo struct {
	Name     string `json:"name"`
	CloneURL string `json:"clone_url"`
	Stars    int    `json:"stars"`
	Size     int    `json:"size"`
}

func main() {
	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		fmt.Println("GITHUB_TOKEN is not set")
		os.Exit(1)
	}

	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	tc := oauth2.NewClient(ctx, ts)

	client := github.NewClient(tc)

	opt := &github.SearchOptions{
		Sort: "stars",
		ListOptions: github.ListOptions{
			PerPage: 13,
		},
	}

	query := "created:>" + time.Now().AddDate(0, 0, -2).Format("2006-01-02") +
		" size:50..6000 is:public"
	result, _, err := client.Search.Repositories(ctx, query, opt)
	if err != nil {
		fmt.Printf("Error searching repositories: %v\n", err)
		os.Exit(1)
	}

	var repos []RepoInfo
	for _, repo := range result.Repositories {
		repos = append(repos, RepoInfo{
			Name:     repo.GetFullName(),
			CloneURL: repo.GetCloneURL(),
			Stars:    repo.GetStargazersCount(),
			Size:     repo.GetSize(),
		})
	}

	jsonData, err := json.MarshalIndent(repos, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	filename := "repos_to_clone.json"
	err = os.WriteFile(filename, jsonData, 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	filename2 := "latest_repos.md"
	f, err := os.Create(filename2)
	if err != nil {
		fmt.Printf("Error creating file: %v\n", err)
		os.Exit(1)
	}
	defer func(f *os.File) {
		err := f.Close()
		if err != nil {

		}
	}(f)

	_, err = fmt.Fprintf(f, "# Latest Repositories (%s)\n\n", time.Now().AddDate(0, 0, -2).Format("2006-01-02"))
	if err != nil {
		return
	}
	for _, repo := range result.Repositories {
		_, err := fmt.Fprintf(f, "- [%s](%s) (%d)\n", repo.GetFullName(), repo.GetHTMLURL(), repo.GetStargazersCount())
		if err != nil {
			return
		}
	}

	fmt.Println("Repository information saved to", filename)
}
