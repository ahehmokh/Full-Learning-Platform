import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "animate.css";
import { PlusCircle, UploadCloud, Link } from "lucide-react";

const AddMaterial = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [materialName, setMaterialName] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoLink, setVideoLink] = useState("");

  const handleAddTopic = () => {
    setTopics((prevTopics) => [
      ...prevTopics,
      { topicName: "", topicContent: "", writtenCode: "" },
    ]);
  };

  const handleRemoveTopic = (index) => {
    setTopics((prevTopics) => prevTopics.filter((_, i) => i !== index));
  };

  const handleTopicChange = (index, field, value) => {
    setTopics((prevTopics) => {
      const updatedTopics = [...prevTopics];
      if (field === "topicName") updatedTopics[index].topicName = value;
      if (field === "topicContent") updatedTopics[index].topicContent = value;
      if (field === "writtenCode") updatedTopics[index].writtenCode = value;
      return updatedTopics;
    });
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!materialName || !materialDescription) {
      toast.error("Please fill in material name and description.");
      setLoading(false);
      return;
    }

    if (isNaN(courseId) || !Number.isInteger(Number(courseId))) {
      toast.error("Invalid courseId.");
      setLoading(false);
      return;
    }

    if (
      pdfFile &&
      !["application/pdf", "application/x-pdf"].includes(pdfFile.type)
    ) {
      toast.error("Please upload a valid PDF file.");
      setLoading(false);
      return;
    }

    if (topics.some((topic) => !topic.topicName || !topic.topicContent)) {
      toast.error("Please fill in all topic details (name and content).");
      setLoading(false);
      return;
    }

    if (videoLink && !isValidUrl(videoLink)) {
      toast.error("Please enter a valid video link URL.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("material_name", materialName);
    formData.append("material_description", materialDescription);
    if (pdfFile) {
      formData.append("file", pdfFile);
    }
    formData.append("topics", JSON.stringify(topics));
    formData.append("video_link", videoLink);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing.");
        navigate("/login");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      // Add new material
      await axios.post(
        `http://localhost:8081/courses/${courseId}/materials`,
        formData,
        { headers }
      );
      toast.success("Material added successfully!");

      navigate(`/courseDetails/${courseId}`);
    } catch (err) {
      console.error("Error adding material:", err);
      if (err.response) {
        console.log("Full backend response:", err.response.data);
        toast.error(
          err.response.data?.message || "Failed to add material."
        );
      } else if (err.request) {
        toast.error(
          "No response from server. Please check your network connection."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-8">
      <div className="container mx-auto bg-white rounded-xl shadow-lg p-8 animate__animated animate__fadeIn">
        <h1
          className="text-4xl font-extrabold text-indigo-700 mb-6 text-center animate__animated animate__fadeInDown"
          style={{ color: "#4f46e5" }}
        >
          Add Material
        </h1>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Material Name */}
          <div>
            <label
              htmlFor="materialName"
              className="block text-sm font-medium text-gray-700"
            >
              Material Name
            </label>
            <input
              id="materialName"
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter material name"
              required
            />
          </div>

          {/* Material Description */}
          <div>
            <label
              htmlFor="materialDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Material Description
            </label>
            <textarea
              id="materialDescription"
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[100px]"
              placeholder="Enter material description"
              required
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label
              htmlFor="pdfFile"
              className="block text-sm font-medium text-gray-700"
            >
              PDF File (optional)
            </label>
            <div className="mt-1 flex items-center">
              <input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="pdfFile"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                style={{
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <UploadCloud className="mr-2 h-5 w-5" />
                <span>Upload PDF</span>
              </label>
              {pdfFile && (
                <span className="ml-2 text-gray-500 text-sm">
                  {pdfFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Video Link */}
          <div>
            <label
              htmlFor="videoLink"
              className="block text-sm font-medium text-gray-700"
            >
              Video Link
            </label>
            <div className="mt-1 flex items-center">
              <input
                id="videoLink"
                type="text"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter video link (optional)"
              />
              <Link className="ml-2 h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Topics */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Topics</h2>
            {topics.map((topic, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <label
                      htmlFor={`topicName-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Topic Name
                    </label>
                    <input
                      id={`topicName-${index}`}
                      type="text"
                      value={topic.topicName}
                      onChange={(e) =>
                        handleTopicChange(index, "topicName", e.target.value)
                      }
                      placeholder="Enter topic name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(index)}
                    className="self-center inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-red-500 hover:bg-red-700 h-9 w-9"
                  >
                    X
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`topicContent-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Topic Content
                  </label>
                  <textarea
                    id={`topicContent-${index}`}
                    value={topic.topicContent}
                    onChange={(e) =>
                      handleTopicChange(index, "topicContent", e.target.value)
                    }
                    placeholder="Enter topic content"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[80px]"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`writtenCode-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Written Code (Optional)
                  </label>
                  <textarea
                    id={`writtenCode-${index}`}
                    value={topic.writtenCode}
                    onChange={(e) =>
                      handleTopicChange(index, "writtenCode", e.target.value)
                    }
                    placeholder="Enter code snippet"
                    className="mt-1 block w-full border border-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[150px] font-mono bg-gray-900 text-white"
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      lineHeight: '1.5rem',
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTopic}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Topic
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 font-semibold rounded-md transition-colors duration-300 bg-indigo-500 text-black hover:bg-indigo-600"
            disabled={loading}
            style={{
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <>Adding Material...</> : "Add Material"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AddMaterial;
